import React from "react";
import EmailBase from "./base.js";

export default function supportAutoTpl({ message }) {
  const safeMsg = (message || "").toString();

  return {
    subject: "We received your message — ThreatNest",
    react: React.createElement(
      EmailBase,
      {
        title: "Message received",
        preview: "We got your message and will reply within 24 hours.",
      },
      [
        React.createElement(
          "p",
          { key: 1, style: { margin: "0 0 12px" } },
          "Thanks for contacting ThreatNest. We received your message and will reply as soon as possible (usually within 24 hours)."
        ),

        React.createElement(
          "div",
          {
            key: 2,
            style: {
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "12px",
              padding: "12px 14px",
              whiteSpace: "pre-wrap",
            },
          },
          safeMsg
        ),

        React.createElement(
          "p",
          {
            key: 3,
            style: { margin: "14px 0 0", color: "rgba(255,255,255,0.75)" },
          },
          "— ThreatNest Support"
        ),
      ]
    ),
  };
}
