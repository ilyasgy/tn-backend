// server.js (secure + minimal: Support + Payment emails only)

import dotenv from "dotenv";
dotenv.config();

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

// IMPORTANT: behind Render/Reverse proxy, this makes req.ip + X-Forwarded-For work correctly
app.set("trust proxy", 1);

app.use(express.json({ limit: "200kb" }));

app.use(
  cors({
    origin: [
      "https://threatnest.com",
      "https://www.threatnest.com",
    ],
    methods: ["GET", "POST", "OPTIONS"],
    credentials: true,
  })
);

// Resend (safe: don't crash if missing)
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// Required env
const SUPPORT_INBOX = process.env.SUPPORT_INBOX || "";
const SUPPORT_FROM = process.env.SUPPORT_FROM || "";
const INTERNAL_KEY = process.env.INTERNAL_KEY || "";

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
      "Pricing depends on your website size and scope. Send your site URL and platform and we’ll confirm the right plan.",
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
    answer: "Yes. Hosting provider doesn’t block the service.",
  },
];

// -----------------------------
// Helpers: validation
// -----------------------------
function isValidEmail(email) {
  return typeof email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function clampStr(v, max) {
  if (typeof v !== "string") return "";
  return v.trim().slice(0, max);
}

// -----------------------------
// Rate limit (per-IP)
// -----------------------------
const RATE_WINDOW_MS = 60_000; // 1 minute
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
// Security: protect payment endpoint (server-to-server only)
// -----------------------------
function requireInternalKey(req, res, next) {
  // Fail closed (safer)
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



app.post("/api/support/ticket", rateLimit(5), async (req, res) => {
  try {
    const { name, email, message, website, pageUrl, company } = req.body || {};

    // Honeypot
    if (company && String(company).trim()) {
      return res.json({ ok: true });
    }

    const nameClean = clampStr(name || "", 120);
    const emailClean = clampStr(email, 200);
    const messageClean = clampStr(message, 2000);
    const websiteClean = clampStr(website || "", 500);
    const pageUrlClean = clampStr(pageUrl || "", 500);

    if (!isValidEmail(emailClean)) {
      return res.status(400).json({ ok: false, error: "Invalid email." });
    }
    if (!messageClean) {
      return res.status(400).json({ ok: false, error: "Message is required." });
    }

    if (!resend || !SUPPORT_INBOX || !SUPPORT_FROM) {
      return res.status(500).json({ ok: false, error: "Email is not configured on the server." });
    }

    // 1) Email to YOU
    const t1 = supportTeamTpl({
      name: nameClean,
      email: emailClean,
      website: websiteClean || "—",
      pageUrl: pageUrlClean || "—",
      message: messageClean,
    });

    await resend.emails.send({
      from: SUPPORT_FROM,
      to: [SUPPORT_INBOX],
      replyTo: emailClean,
      subject: t1.subject,
      react: t1.react,
    });

    // 2) Auto-reply to USER
    const t2 = supportAutoTpl({
      name: nameClean,
      email: emailClean,
      website: websiteClean || "",
      message: messageClean,
    });

    await resend.emails.send({
      from: SUPPORT_FROM,
      to: [emailClean],
      subject: t2.subject,
      react: t2.react,
    });

    return res.json({ ok: true });
  } catch (err) {
    console.error("support ticket error:", err);
    return res.status(500).json({ ok: false, error: "Failed to send email." });
  }
});

// Payment status email (PRIVATE endpoint):
// - MUST be called server-to-server (never from browser)
// - protected by INTERNAL_KEY header
// - higher rate limit is ok (internal)
app.post("/api/payment/status", requireInternalKey, rateLimit(20), async (req, res) => {
  try {
    const { email, status, clientName, amount, orderId, reason } = req.body || {};

    const emailClean = clampStr(email, 200);
    const statusClean = clampStr(status, 20).toLowerCase();
    const clientNameClean = clampStr(clientName || "", 120);
    const orderIdClean = clampStr(orderId || "", 120);
    const reasonClean = clampStr(reason || "", 300);

    // amount could be string/number — just clamp as string for display
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
      const t = paymentSuccessTpl({ clientName: clientNameClean, amount: amountClean, orderId: orderIdClean });

      await resend.emails.send({
        from: SUPPORT_FROM,
        to: [emailClean],
        subject: t.subject,
        react: t.react,
      });

      return res.json({ ok: true });
    }

    if (statusClean === "failed") {
      const t = paymentFailedTpl({ clientName: clientNameClean, orderId: orderIdClean, reason: reasonClean });

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
// Start
// -----------------------------
const port = process.env.PORT || 3000;
app.listen(port, () => console.log("API running on", port));
