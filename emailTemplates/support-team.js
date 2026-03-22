import React from "react";
import EmailBase, { safe } from "./base.js";

export default function supportTeamTpl({
  email,
  message,
  topic,
  category,
  website,
  pageUrl,
  title,
  preview,
}) {
  const rows = [
    ["From", safe(email)],
    ["Topic", safe(topic, "General")],
    ["Category", safe(category)],
    ["Website", safe(website)],
    ["Page", safe(pageUrl)],
  ].filter(([, value]) => {
    const s = String(value || "").trim();
    return s && s !== "—";
  });

  const cardStyle = {
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
    padding: "18px",
  };

  const labelStyle = {
    width: "96px",
    color: "#4b5563",
    fontWeight: 600,
    lineHeight: "20px",
    flexShrink: 0,
  };

  const valueStyle = {
    color: "#111827",
    lineHeight: "20px",
    wordBreak: "break-word",
    overflowWrap: "anywhere",
  };

  const linkStyle = {
    color: "#2563eb",
    fontWeight: 600,
    textDecoration: "none",
    wordBreak: "break-word",
    overflowWrap: "anywhere",
  };

  const msgTitleStyle = {
    margin: "0 0 10px",
    fontSize: "14px",
    fontWeight: 700,
    color: "#111827",
  };

  const msgBodyStyle = {
    margin: 0,
    color: "#374151",
    whiteSpace: "pre-wrap",
    lineHeight: 1.7,
  };

  const finalTopic = safe(topic, "General");
  const finalTitle = safe(title, "New Support Ticket");
  const finalPreview = safe(preview, "A new message was submitted.");

  return {
    subject: `ThreatNest — ${finalTopic}`,
    react: React.createElement(
      EmailBase,
      { title: finalTitle, preview: finalPreview },
      [
        React.createElement(
          "div",
          { key: "details", style: { ...cardStyle, marginBottom: "14px" } },
          rows.map(([label, value], i) => {
            const s = String(value || "");
            const isEmail = label === "From" && s.includes("@");
            const isUrl = (label === "Website" || label === "Page") && s.startsWith("http");

            const valueNode = isEmail
              ? React.createElement("a", { href: `mailto:${s}`, style: linkStyle }, s)
              : isUrl
              ? React.createElement("a", { href: s, style: linkStyle }, s)
              : React.createElement("span", { style: valueStyle }, s);

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
              React.createElement("div", { style: valueStyle }, valueNode)
            );
          })
        ),

        React.createElement(
          "div",
          { key: "message", style: cardStyle },
          React.createElement("div", { style: msgTitleStyle }, "Message"),
          React.createElement("p", { style: msgBodyStyle }, safe(message, ""))
        ),
      ]
    ),
  };
}
