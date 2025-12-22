import express from "express";
import cors from "cors";
import { Resend } from "resend";

const app = express();
app.use(express.json());

// allow your Vercel site to call the API
app.use(
  cors({
    origin: ["https://threatnest.com", "https://www.threatnest.com"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  })
);

// Resend client (BACKEND ONLY)
const resend = new Resend(process.env.RESEND_API_KEY);

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

app.get("/health", (req, res) => {
  res.json({ ok: true, message: "API is running" });
});

app.get("/debug/env", (req, res) => {
  res.json({
    hasResendKey: !!process.env.RESEND_API_KEY,
    supportFrom: process.env.SUPPORT_FROM || null,
    supportInbox: process.env.SUPPORT_INBOX || null,
  });
});


// ✅ fixed options for the help widget
app.get("/api/support/options", (req, res) => {
  res.json({ ok: true, options: SUPPORT_OPTIONS });
});

function esc(s = "") {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

// ✅ talk to a human (ticket) — sends email to you + auto-reply to user
app.post("/api/support/ticket", async (req, res) => {
  try {
    const { email, message, website, topic, pageUrl, relatedTopic, relatedCategory } = req.body || {};

    if (!email || !message) {
      return res.status(400).json({ ok: false, error: "Email and message are required." });
    }

    const inbox = process.env.SUPPORT_INBOX; // support@threatnest.com
    const from = process.env.SUPPORT_FROM;   // e.g. "ThreatNest Support <onboarding@resend.dev>" or verified domain sender

    if (!process.env.RESEND_API_KEY || !inbox || !from) {
      return res.status(500).json({
        ok: false,
        error: "Email is not configured on the server (missing env vars).",
      });
    }

    const finalTopic = relatedTopic || topic || "General";
    const finalCategory = relatedCategory || "—";
    const finalWebsite = website || "—";
    const finalPage = pageUrl || "—";

    // 1) Email to YOU (support inbox)
    await resend.emails.send({
      from,
      to: [inbox],
      replyTo: email,
      subject: `ThreatNest Support — ${finalTopic}`,
      html: `
        <div style="font-family:system-ui,Segoe UI,Roboto,Arial;line-height:1.55">
          <h2 style="margin:0 0 12px">New Support Ticket</h2>
          <p style="margin:0 0 6px"><b>From:</b> ${esc(email)}</p>
          <p style="margin:0 0 6px"><b>Topic:</b> ${esc(finalTopic)}</p>
          <p style="margin:0 0 6px"><b>Category:</b> ${esc(finalCategory)}</p>
          <p style="margin:0 0 6px"><b>Website:</b> ${esc(finalWebsite)}</p>
          <p style="margin:0 0 12px"><b>Page:</b> ${esc(finalPage)}</p>
          <hr/>
          <pre style="white-space:pre-wrap;margin:12px 0 0">${esc(message)}</pre>
        </div>
      `,
    });

    // 2) Auto-reply to USER
    await resend.emails.send({
      from,
      to: [email],
      subject: "We received your message — ThreatNest",
      html: `
        <div style="font-family:system-ui,Segoe UI,Roboto,Arial;line-height:1.55">
          <p>Hi,</p>
          <p>Thanks for contacting <b>ThreatNest</b>. We received your message and will reply as soon as possible (usually within <b>24 hours</b>).</p>
          <p style="margin:16px 0 8px"><b>Your message:</b></p>
          <pre style="white-space:pre-wrap;margin:0">${esc(message)}</pre>
          <p style="margin-top:16px">— ThreatNest Support</p>
        </div>
      `,
    });

    return res.json({ ok: true });
  } catch (err) {
    console.error("support ticket error:", err);
    return res.status(500).json({ ok: false, error: "Failed to send email." });
  }
});

// keep your existing contact route if you want
app.post("/api/contact", (req, res) => {
  res.json({ ok: true });
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log("API running on", port));
