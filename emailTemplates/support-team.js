import React from "react";
import EmailBase, { safe } from "./base.js";

export default function supportTeamTpl({ email, message, topic, category, website, pageUrl }) {
  const rows = [
    ["From", safe(email)],
    ["Topic", safe(topic, "General")],
    ["Category", safe(category)],
    ["Website", safe(website)],
    ["Page", safe(pageUrl)],
  ];

  // Light theme (email-safe). Dark-mode clients may invert, but this stays readable.
  const cardStyle = {
    background: "#ffffff",
    border: "1px solid #e5e7eb", // gray-200
    borderRadius: "12px",
    padding: "18px",
  };

  const labelStyle = {
    width: "96px",
    color: "#4b5563", // gray-600
    fontWeight: 600,
    lineHeight: "20px",
    flexShrink: 0,
  };

  const valueStyle = {
    color: "#111827", // gray-900
    lineHeight: "20px",
    wordBreak: "break-word",
    overflowWrap: "anywhere",
  };

  const linkStyle = {
    color: "#2563eb", // blue-600
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
    color: "#374151", // gray-700
    whiteSpace: "pre-wrap",
    lineHeight: 1.7,
  };

  return {
    subject: `ThreatNest Support — ${safe(topic, "General")}`,
    react: React.createElement(
      EmailBase,
      { title: "New Support Ticket", preview: "A new support message was submitted." },
      [
        // DETAILS CARD
        React.createElement(
          "div",
          { key: "details", style: { ...cardStyle, marginBottom: "14px" } },
          rows.map(([label, value], i) => {
            const isEmail = label === "From" && typeof value === "string" && value.includes("@");
            const isUrl = (label === "Website" || label === "Page") && typeof value === "string" && value.startsWith("http");

            const valueNode =
              isEmail ? (
                React.createElement("a", { href: `mailto:${value}`, style: linkStyle }, value)
              ) : isUrl ? (
                React.createElement("a", { href: value, style: linkStyle }, value)
              ) : (
                React.createElement("span", { style: valueStyle }, value)
              );

            return React.createElement(
              "div",
              {
                key: i,
                style: {
                  display: "flex",
                  gap: "14px",
                  padding: "8px 0",
                  borderBottom: i === rows.length - 1 ? "none" : "1px solid #f3f4f6", // gray-100
                },
              },
              React.createElement("div", { style: labelStyle }, `${label}:`),
              React.createElement("div", { style: valueStyle }, valueNode)
            );
          })
        ),

        // MESSAGE CARD
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
