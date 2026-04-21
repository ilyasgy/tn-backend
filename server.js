// server.js

import dotenv from "dotenv";
dotenv.config();

import https from "node:https";
import express from "express";
import cors from "cors";
import { Resend } from "resend";

// Email templates
import supportTeamTpl from "./emailTemplates/support-team.js";
import supportAutoTpl from "./emailTemplates/support-auto.js";
import paymentSuccessTpl from "./emailTemplates/payment-success.js";
import paymentFailedTpl from "./emailTemplates/payment-failed.js";

// -----------------------------
// App + Config
// -----------------------------
const app = express();

const DEFAULT_ALLOWED_ORIGINS = [
  "https://threatnest.com",
  "https://www.threatnest.com",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://localhost:3001",
  "http://127.0.0.1:3001",
];

function parseAllowedOrigins(...values) {
  return values
    .filter(Boolean)
    .flatMap((value) => String(value).split(","))
    .map((value) => value.trim())
    .filter(Boolean);
}

const ALLOWED_ORIGINS = new Set([
  ...DEFAULT_ALLOWED_ORIGINS,
  ...parseAllowedOrigins(
    process.env.ALLOWED_ORIGINS,
    process.env.FRONTEND_URL,
    process.env.APP_URL
  ),
]);

app.set("trust proxy", 1);
app.use(express.json({ limit: "200kb" }));

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || ALLOWED_ORIGINS.has(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "OPTIONS"],
    credentials: true,
  })
);

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const SUPPORT_INBOX = process.env.SUPPORT_INBOX || "";
const SUPPORT_FROM = process.env.SUPPORT_FROM || "";
const INTERNAL_KEY = process.env.INTERNAL_KEY || "";
const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL || "";

// -----------------------------
// Support widget fixed options
// -----------------------------
const SUPPORT_OPTIONS = [
  {
    id: "scope",
    title: "What do you check?",
    keywords: ["scope", "check", "audit", "test", "included", "report"],
    answer: `We review key website security + flow issues:
• Security headers
• Auth/session hygiene
• CSRF basics
• Login protections
• Access control/IDOR checks
• File upload checks
• Re-test after fixes`,
  },
  {
    id: "pricing",
    title: "Pricing & plans",
    keywords: ["price", "pricing", "cost", "plan"],
    answer:
      "Pricing depends on your website size and scope. Send your site URL and platform and we'll confirm the right plan.",
  },
  {
    id: "turnaround",
    title: "How long does it take?",
    keywords: ["time", "delivery", "48", "hours"],
    answer: "Standard delivery is 48 hours after payment and authorization is confirmed.",
  },
  {
    id: "requirements",
    title: "What do you need from me?",
    keywords: ["need", "requirements", "access", "login"],
    answer:
      "Usually your website URL + confirmation you own/control it. If a login flow needs checking, we may request a test account or limited access.",
  },
  {
    id: "legal",
    title: "Is this legal / authorized?",
    keywords: ["legal", "authorized", "permission", "consent"],
    answer: "We only work with the website owner (or written permission).",
  },
  {
    id: "hosting",
    title: "Do you work with Netlify/Render/Vercel?",
    keywords: ["netlify", "render", "vercel", "hosting"],
    answer: "Yes. Hosting provider doesn't block the service.",
  },
];

// -----------------------------
// Helpers
// -----------------------------
function isValidEmail(email) {
  return typeof email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function clampStr(v, max) {
  if (typeof v !== "string") return "";
  return v.trim().slice(0, max);
}

function asBool(v) {
  if (typeof v === "boolean") return v;
  if (typeof v === "number") return v === 1;
  if (typeof v === "string") {
    return ["true", "1", "yes", "on"].includes(v.trim().toLowerCase());
  }
  return false;
}

function escapeSlackText(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function slackField(label, value) {
  const cleanValue = clampStr(value || "", 500);
  if (!cleanValue) return null;

  return {
    type: "mrkdwn",
    text: `*${escapeSlackText(label)}*\n${escapeSlackText(cleanValue)}`,
  };
}

function postJson(url, payload) {
  return new Promise((resolve, reject) => {
    try {
      const target = new URL(url);
      const body = JSON.stringify(payload);
      const request = https.request(
        {
          protocol: target.protocol,
          hostname: target.hostname,
          port: target.port || (target.protocol === "https:" ? 443 : 80),
          path: `${target.pathname}${target.search}`,
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Content-Length": Buffer.byteLength(body),
          },
        },
        (response) => {
          let responseBody = "";
          response.setEncoding("utf8");
          response.on("data", (chunk) => {
            responseBody += chunk;
          });
          response.on("end", () => {
            if (response.statusCode >= 200 && response.statusCode < 300) {
              resolve(responseBody || "ok");
              return;
            }

            reject(
              new Error(
                `Slack webhook failed (${response.statusCode || "unknown"}): ${
                  responseBody || "empty response"
                }`
              )
            );
          });
        }
      );

      request.on("error", reject);
      request.write(body);
      request.end();
    } catch (error) {
      reject(error);
    }
  });
}

async function sendSlackNotification({ title, summary, fields = [], notes }) {
  if (!SLACK_WEBHOOK_URL) return;

  const activeFields = fields.filter(Boolean).slice(0, 10);
  const cleanSummary = clampStr(summary || "", 500);
  const cleanNotes = clampStr(notes || "", 1200);

  const blocks = [
    {
      type: "header",
      text: {
        type: "plain_text",
        text: clampStr(title || "New submission", 150),
        emoji: true,
      },
    },
    cleanSummary
      ? {
          type: "section",
          text: {
            type: "mrkdwn",
            text: escapeSlackText(cleanSummary),
          },
        }
      : null,
    activeFields.length
      ? {
          type: "section",
          fields: activeFields,
        }
      : null,
    cleanNotes
      ? {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `*Notes*\n${escapeSlackText(cleanNotes)}`,
          },
        }
      : null,
  ].filter(Boolean);

  await postJson(SLACK_WEBHOOK_URL, {
    text: clampStr(title || "New submission", 150),
    blocks,
  });
}

// -----------------------------
// Rate limit (per-IP)
// -----------------------------
const RATE_WINDOW_MS = 60_000;
const rateMap = new Map();

function getClientIp(req) {
  const fwd = (req.headers["x-forwarded-for"] || "").toString();
  return fwd.split(",")[0].trim() || req.socket?.remoteAddress || "unknown";
}

function rateLimit(maxPerMin) {
  return (req, res, next) => {
    const ip = `${getClientIp(req)}:${req.path}`;
    const now = Date.now();
    const record = rateMap.get(ip) || { count: 0, resetAt: now + RATE_WINDOW_MS };

    if (now > record.resetAt) {
      record.count = 0;
      record.resetAt = now + RATE_WINDOW_MS;
    }

    record.count += 1;
    rateMap.set(ip, record);

    if (record.count > maxPerMin) {
      return res.status(429).json({ ok: false, error: "Too many requests. Try again soon." });
    }

    next();
  };
}

setInterval(() => {
  const now = Date.now();
  for (const [ip, rec] of rateMap.entries()) {
    if (now > rec.resetAt + RATE_WINDOW_MS) rateMap.delete(ip);
  }
}, 10 * 60_000).unref?.();

// -----------------------------
// Security: protect payment endpoint
// -----------------------------
function requireInternalKey(req, res, next) {
  if (!INTERNAL_KEY) {
    return res.status(500).json({ ok: false, error: "Server misconfigured." });
  }

  const key = req.headers["x-internal-key"];
  if (!key || key !== INTERNAL_KEY) {
    return res.status(401).json({ ok: false, error: "Unauthorized" });
  }

  next();
}

// -----------------------------
// Routes
// -----------------------------
app.get("/health", (req, res) => {
  res.json({ ok: true, message: "API is running" });
});

app.get("/api/support/options", (req, res) => {
  res.json({ ok: true, options: SUPPORT_OPTIONS });
});

// -----------------------------
// Start Request Route
// -----------------------------
app.post("/api/start/request", rateLimit(5), async (req, res) => {
  try {
    const {
      fullName,
      email,
      website,
      pageUrl,
      platform,
      siteType,
      budgetRange,
      timeline,
      needsDev,
      needsSecurity,
      webSelected,
      securitySelected,
      githubAccess,
      concerns,
      authorization,
      company,
      testEmail,
      testPassword,
      limitedAccess,
    } = req.body || {};

    if (company && String(company).trim()) {
      return res.json({ ok: true });
    }

    const fullNameClean = clampStr(fullName || "", 120);
    const emailClean = clampStr(email || "", 200);
    const websiteClean = clampStr(website || "", 500);
    const pageUrlClean = clampStr(pageUrl || "", 500);
    const platformClean = clampStr(platform || "", 120);
    const siteTypeClean = clampStr(siteType || "", 120);
    const budgetRangeClean = clampStr(budgetRange || "", 120);
    const timelineClean = clampStr(timeline || "", 120);
    const githubAccessClean = clampStr(githubAccess || "", 500);
    const concernsClean = clampStr(concerns || "", 2000);
    const testEmailClean = clampStr(testEmail || "", 200);
    const testPasswordClean = clampStr(testPassword || "", 200);
    const limitedAccessClean = clampStr(limitedAccess || "", 1000);
    const needsDevClean = asBool(needsDev) || asBool(webSelected);
    const needsSecurityClean = asBool(needsSecurity) || asBool(securitySelected);
    const authorizationClean = asBool(authorization);

    if (!fullNameClean) {
      return res.status(400).json({ ok: false, error: "Full name is required." });
    }

    if (!isValidEmail(emailClean)) {
      return res.status(400).json({ ok: false, error: "Invalid email." });
    }

    if (!websiteClean) {
      return res.status(400).json({ ok: false, error: "Website is required." });
    }

    if (!needsDevClean && !needsSecurityClean) {
      return res.status(400).json({ ok: false, error: "Choose at least one service." });
    }

    if (needsSecurityClean && !authorizationClean) {
      return res.status(400).json({ ok: false, error: "Authorization is required." });
    }

    if (!resend || !SUPPORT_INBOX || !SUPPORT_FROM) {
      return res.status(500).json({ ok: false, error: "Email is not configured on the server." });
    }

    const requestedWork = [
      needsSecurityClean ? "Security review" : "",
      needsDevClean ? "Web development" : "",
    ]
      .filter(Boolean)
      .join(" + ");

    const requestDetails = [
      ["Requested work", requestedWork],
      ["Platform", platformClean || "Not provided"],
      needsDevClean ? ["Site type", siteTypeClean || "Not provided"] : null,
      needsDevClean ? ["Budget range", budgetRangeClean || "Not provided"] : null,
      needsDevClean ? ["Timeline", timelineClean || "Not provided"] : null,
      needsSecurityClean ? ["GitHub / repo access", githubAccessClean || "Not provided"] : null,
      needsSecurityClean ? ["Authorization", authorizationClean ? "Confirmed" : "Missing"] : null,
      testEmailClean ? ["Test email", testEmailClean] : null,
      testPasswordClean ? ["Temporary test password", testPasswordClean] : null,
      limitedAccessClean ? ["Access notes", limitedAccessClean] : null,
    ].filter(Boolean);

    const teamTopic =
      needsDevClean && needsSecurityClean
        ? "Start: Web Development + Security Review"
        : needsDevClean
        ? "Start: Web Development"
        : "Start: Security Review";

    const t1 = supportTeamTpl({
      name: fullNameClean,
      email: emailClean,
      website: websiteClean,
      pageUrl: pageUrlClean || "https://threatnest.com/start",
      topic: teamTopic,
      category: "Start form",
      intro: "A new start request came in from the website.",
      details: requestDetails,
      detailsTitle: "Selected options",
      message: concernsClean || "No extra notes were provided.",
      messageTitle: needsSecurityClean ? "Priority areas / notes" : "Project notes",
      title: "New Start Request",
      preview: "A new start request was submitted.",
    });

    await resend.emails.send({
      from: SUPPORT_FROM,
      to: [SUPPORT_INBOX],
      replyTo: emailClean,
      subject: t1.subject,
      react: t1.react,
    });

    const t2 = supportAutoTpl({
      name: fullNameClean,
      email: emailClean,
      website: websiteClean,
      summary: `We received your ${requestedWork.toLowerCase()} request and will review it shortly.`,
      details: [
        ["Requested work", requestedWork],
        ["Platform", platformClean || "Not provided"],
        needsDevClean ? ["Site type", siteTypeClean || "Not provided"] : null,
        needsDevClean ? ["Budget range", budgetRangeClean || "Not provided"] : null,
        needsDevClean ? ["Timeline", timelineClean || "Not provided"] : null,
        needsSecurityClean ? ["GitHub / repo access", githubAccessClean || "Not provided"] : null,
      ].filter(Boolean),
      detailsTitle: "What we received",
      nextSteps: [
        "We review the request and confirm the scope.",
        needsSecurityClean
          ? "If needed, we will ask for limited access or a temporary test account."
          : "We reply with timing, pricing, and the best next step for the build.",
        "We follow up by email with the next step.",
      ],
      message: concernsClean,
      messageTitle: concernsClean ? "Your notes" : "Notes",
      title: "Start request received",
      preview: "We got your start request and will review it shortly.",
      intro: "Thanks for starting with ThreatNest. We received your request and will review it shortly.",
      subject: "We received your start request - ThreatNest",
    });

    await resend.emails.send({
      from: SUPPORT_FROM,
      to: [emailClean],
      subject: t2.subject,
      react: t2.react,
    });

    await sendSlackNotification({
      title: "New start request",
      summary: `${requestedWork} submitted from the website.`,
      fields: [
        slackField("Name", fullNameClean),
        slackField("Email", emailClean),
        slackField("Website", websiteClean),
        slackField("Platform", platformClean || "Not provided"),
        needsDevClean ? slackField("Site type", siteTypeClean || "Not provided") : null,
        needsDevClean ? slackField("Budget", budgetRangeClean || "Not provided") : null,
        needsDevClean ? slackField("Timeline", timelineClean || "Not provided") : null,
        needsSecurityClean
          ? slackField("GitHub / repo", githubAccessClean || "Not provided")
          : null,
        needsSecurityClean
          ? slackField("Authorization", authorizationClean ? "Confirmed" : "Missing")
          : null,
        slackField("Page", pageUrlClean || "https://threatnest.com/start"),
      ],
      // Keep Slack summaries useful, but avoid sending test credentials there.
      notes: concernsClean,
    }).catch((error) => {
      console.error("start request slack notification error:", error);
    });

    return res.json({ ok: true });
  } catch (err) {
    console.error("start request error:", err);
    return res.status(500).json({ ok: false, error: "Failed to send request." });
  }
});

// -----------------------------
// Contact / Support Route
// -----------------------------
app.post("/api/support/ticket", rateLimit(5), async (req, res) => {
  try {
    const {
      name,
      email,
      message,
      website,
      pageUrl,
      company,
      topic,
      category,
    } = req.body || {};

    if (company && String(company).trim()) {
      return res.json({ ok: true });
    }

    const nameClean = clampStr(name || "", 120);
    const emailClean = clampStr(email || "", 200);
    const messageClean = clampStr(message || "", 2000);
    const websiteClean = clampStr(website || "", 500);
    const pageUrlClean = clampStr(pageUrl || "", 500);
    const topicClean = clampStr(topic || "Contact Request", 160);
    const categoryClean = clampStr(category || "Contact", 120);
    const hasEmail = Boolean(emailClean);

    if (!nameClean) {
      return res.status(400).json({ ok: false, error: "Name is required." });
    }

    if (hasEmail && !isValidEmail(emailClean)) {
      return res.status(400).json({ ok: false, error: "Invalid email." });
    }

    if (!messageClean) {
      return res.status(400).json({ ok: false, error: "Message is required." });
    }

    if (!resend || !SUPPORT_INBOX || !SUPPORT_FROM) {
      return res.status(500).json({ ok: false, error: "Email is not configured on the server." });
    }

    const t1 = supportTeamTpl({
      name: nameClean,
      email: emailClean,
      website: websiteClean,
      pageUrl: pageUrlClean || "/contact",
      topic: topicClean,
      category: categoryClean,
      intro: "A new contact request came in from the website.",
      message: messageClean,
      title: "New Contact Request",
      preview: "A new contact request was submitted.",
    });

    await resend.emails.send({
      from: SUPPORT_FROM,
      to: [SUPPORT_INBOX],
      replyTo: hasEmail ? emailClean : undefined,
      subject: t1.subject,
      react: t1.react,
    });

    if (hasEmail) {
      const t2 = supportAutoTpl({
        name: nameClean,
        email: emailClean,
        website: websiteClean,
        summary: `We received your ${categoryClean.toLowerCase()} message.`,
        details: [["Subject", categoryClean]],
        detailsTitle: "Message details",
        nextSteps: [
          "We review your message.",
          "We reply within about 1 business day.",
        ],
        message: messageClean,
        messageTitle: "Your message",
        title: "Message received",
        preview: "We got your message and will reply within 24 hours.",
        intro: "Thanks for contacting ThreatNest. We received your message and usually reply within 1 business day.",
        subject: "We received your message - ThreatNest",
      });

      await resend.emails.send({
        from: SUPPORT_FROM,
        to: [emailClean],
        subject: t2.subject,
        react: t2.react,
      });
    }

    await sendSlackNotification({
      title: "New contact request",
      summary: `${categoryClean} message submitted from the website.`,
      fields: [
        slackField("Name", nameClean),
        slackField("Email", emailClean || "Not provided"),
        slackField("Website", websiteClean || "Not provided"),
        slackField("Subject", categoryClean),
        slackField("Page", pageUrlClean || "/contact"),
      ],
      notes: messageClean,
    }).catch((error) => {
      console.error("contact slack notification error:", error);
    });

    return res.json({ ok: true });
  } catch (err) {
    console.error("support ticket error:", err);
    return res.status(500).json({ ok: false, error: "Failed to send email." });
  }
});

// -----------------------------
// Payment status email
// -----------------------------
app.post("/api/payment/status", requireInternalKey, rateLimit(20), async (req, res) => {
  try {
    const { email, status, clientName, amount, orderId, reason } = req.body || {};

    const emailClean = clampStr(email, 200);
    const statusClean = clampStr(status, 20).toLowerCase();
    const clientNameClean = clampStr(clientName || "", 120);
    const orderIdClean = clampStr(orderId || "", 120);
    const reasonClean = clampStr(reason || "", 300);
    const amountClean = clampStr(amount != null ? String(amount) : "", 50);

    if (!isValidEmail(emailClean)) {
      return res.status(400).json({ ok: false, error: "Invalid email." });
    }

    if (!statusClean) {
      return res.status(400).json({ ok: false, error: "status is required." });
    }

    if (!resend || !SUPPORT_FROM) {
      return res.status(500).json({ ok: false, error: "Email is not configured on the server." });
    }

    if (statusClean === "success") {
      const t = paymentSuccessTpl({
        clientName: clientNameClean,
        amount: amountClean,
        orderId: orderIdClean,
      });

      await resend.emails.send({
        from: SUPPORT_FROM,
        to: [emailClean],
        subject: t.subject,
        react: t.react,
      });

      return res.json({ ok: true });
    }

    if (statusClean === "failed") {
      const t = paymentFailedTpl({
        clientName: clientNameClean,
        orderId: orderIdClean,
        reason: reasonClean,
      });

      await resend.emails.send({
        from: SUPPORT_FROM,
        to: [emailClean],
        subject: t.subject,
        react: t.react,
      });

      return res.json({ ok: true });
    }

    return res.status(400).json({ ok: false, error: "status must be: success | failed" });
  } catch (err) {
    console.error("payment status email error:", err);
    return res.status(500).json({ ok: false, error: "Failed to send email." });
  }
});

// -----------------------------
// Start server
// -----------------------------
const port = process.env.PORT || 3000;
app.listen(port, () => console.log("API running on", port));
