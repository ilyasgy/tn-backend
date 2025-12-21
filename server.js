import express from "express";
import cors from "cors";

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

// ✅ fixed options for the help widget
app.get("/api/support/options", (req, res) => {
  res.json({ ok: true, options: SUPPORT_OPTIONS });
});

// ✅ talk to a human (ticket)
app.post("/api/support/ticket", (req, res) => {
  const { email, message, website, topic, pageUrl } = req.body || {};

  if (!email || !message) {
    return res.status(400).json({ ok: false, error: "Email and message are required." });
  }

  // For now: just log it (later you can save to DB + email it)
  console.log("NEW SUPPORT TICKET:", {
    email,
    website,
    topic,
    pageUrl,
    message,
    createdAt: new Date().toISOString(),
  });

  res.json({ ok: true });
});

// keep your existing contact route if you want
app.post("/api/contact", (req, res) => {
  const { name, email, message } = req.body;
  res.json({ ok: true });
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log("API running on", port));
