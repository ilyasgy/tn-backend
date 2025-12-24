import React from "react";
import EmailBase, { safe } from "./base.js";

export default function supportTeamTpl({ email, message, topic, category, website, pageUrl }) {
  const safe = (v, dash = "—") => (v && String(v).trim() ? String(v).trim() : dash);

  const rows = [
    ["From", safe(email)],
    ["Topic", safe(topic, "General")],
    ["Category", safe(category)],
    ["Website", safe(website)],
    ["Page", safe(pageUrl)],
  ];

  return {
    subject: `ThreatNest Support — ${safe(topic, "General")}`,
    react: React.createElement(
      EmailBase,
      { title: "New Support Ticket", preview: "A new support message was submitted." },
      [
        React.createElement(
          "div",
          {
            key: 1,
            style: {
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "12px",
              padding: "14px",
              marginBottom: "14px",
            },
          },
          rows.map((r, i) =>
            React.createElement(
              "div",
              { key: i, style: { display: "flex", gap: "10px", marginBottom: i === rows.length - 1 ? 0 : "8px" } },
              React.createElement(
                "div",
                { style: { width: "92px", color: "rgba(255,255,255,0.65)" } },
                r[0] + ":"
              ),
              React.createElement("div", { style: { color: "rgba(255,255,255,0.92)" } }, r[1])
            )
          )
        ),

        React.createElement(
          "div",
          {
            key: 2,
            style: {
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "12px",
              padding: "14px",
            },
          },
          React.createElement(
            "div",
            { style: { fontSize: "12px", color: "rgba(255,255,255,0.65)", marginBottom: "8px" } },
            "Message"
          ),
          React.createElement(
            "div",
            { style: { whiteSpace: "pre-wrap" } },
            safe(message, "")
          )
        ),
      ]
    ),
  };
}
