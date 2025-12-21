import express from "express";
import cors from "cors";

const app = express();
app.use(express.json());

// allow your Vercel site to call the API
app.use(cors({
  origin: [
    "https://threatnest.com",
    "https://www.threatnest.com",
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true,
}));

app.get("/health", (req, res) => {
  res.json({ ok: true, message: "API is running" });
});

app.post("/api/contact", (req, res) => {
  const { name, email, message } = req.body;
  // later: save to DB + email notification
  res.json({ ok: true });
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log("API running on", port));
