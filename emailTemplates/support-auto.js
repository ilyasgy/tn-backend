import React from "react";
import EmailBase, { safe } from "./base.js";

export default function supportAutoTpl({
  name,
  email,
  website,
  message,
  title,
  preview,
  intro,
  subject,
}) {
  const rows = [
    ["Email", safe(email)],
    ["Name", safe(name)],
    ["Website", safe(website, "—")],
  ].filter(([, value]) => {
    const s = String(value || "").trim();
    return s && s !== "—";
  });

  const cardStyle = {
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
    padding: "16px",
  };

  const labelStyle = {
    width: "92px",
    color: "#4b5563",
    fontWeight: 700,
    lineHeight: "20px",
    flexShrink: 0,
  };

  const valueWrapStyle = {
    color: "#111827",
    lineHeight: "20px",
    wordBreak: "break-word",
    overflowWrap: "anywhere",
  };

  const linkStyle = {
    color: "#2563eb",
    fontWeight: 800,
    textDecoration: "none",
    wordBreak: "break-word",
    overflowWrap: "anywhere",
  };

  const msgTitleStyle = {
    margin: "0 0 10px",
    fontSize: "14px",
    fontWeight: 900,
    color: "#111827",
  };

  const msgBodyStyle = {
    margin: 0,
    color: "#374151",
    whiteSpace: "pre-wrap",
    lineHeight: 1.75,
  };

  const finalTitle = safe(title, "Message received");
  const finalPreview = safe(preview, "We got your message and will reply within 24 hours.");
  const finalIntro = safe(
    intro,
    "Thanks for contacting ThreatNest — we received your message. We usually reply within 24 hours."
  );
  const finalSubject = safe(subject, "We received your message — ThreatNest");

  return {
    subject: finalSubject,
    react: React.createElement(
      EmailBase,
      {
        title: finalTitle,
        preview: finalPreview,
      },
      [
        React.createElement(
          "p",
          { key: "p1", style: { margin: "0 0 12px", color: "#111827" } },
          finalIntro
        ),

        React.createElement(
          "div",
          { key: "details", style: { ...cardStyle, marginBottom: "12px" } },
          rows.map(([label, value], i) => {
            const s = String(value || "");
            const isEmail = label === "Email" && s.includes("@");
            const isUrl = label === "Website" && s.startsWith("http");

            const valueNode = isEmail
              ? React.createElement("a", { href: `mailto:${s}`, style: linkStyle }, s)
              : isUrl
              ? React.createElement("a", { href: s, style: linkStyle }, s)
              : React.createElement("span", null, safe(s));

            return React.createElement(
              "div",
              {
                key: i,
                style: {
                  display: "flex",
                  gap: "14px",
                  padding: "8px 0",
                  borderBottom: i === rows.length - 1 ? "none" : "1px solid #f3f4f6",
                },
              },
              React.createElement("div", { style: labelStyle }, `${label}:`),
              React.createElement("div", { style: valueWrapStyle }, valueNode)
            );
          })
        ),

        React.createElement(
          "div",
          { key: "msg", style: cardStyle },
          React.createElement("div", { style: msgTitleStyle }, "Message"),
          React.createElement("p", { style: msgBodyStyle }, safe(message, ""))
        ),
      ]
    ),
  };
}
