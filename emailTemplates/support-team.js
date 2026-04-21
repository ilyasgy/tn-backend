import React from "react";
import EmailBase, { safe } from "./base.js";

const CARD_STYLE = {
  background: "#ffffff",
  border: "1px solid #e5e7eb",
  borderRadius: "14px",
  padding: "18px",
};

const SECTION_TITLE_STYLE = {
  margin: "0 0 12px",
  fontSize: "13px",
  fontWeight: 800,
  letterSpacing: "0.04em",
  textTransform: "uppercase",
  color: "#111827",
};

const ROW_LABEL_STYLE = {
  width: "118px",
  color: "#4b5563",
  fontWeight: 700,
  lineHeight: "20px",
  flexShrink: 0,
};

const VALUE_STYLE = {
  color: "#111827",
  lineHeight: "20px",
  wordBreak: "break-word",
  overflowWrap: "anywhere",
};

const LINK_STYLE = {
  color: "#2563eb",
  fontWeight: 700,
  textDecoration: "none",
  wordBreak: "break-word",
  overflowWrap: "anywhere",
};

const INTRO_STYLE = {
  margin: "0 0 12px",
  color: "#111827",
};

const MESSAGE_BODY_STYLE = {
  margin: 0,
  color: "#374151",
  whiteSpace: "pre-wrap",
  lineHeight: 1.7,
};

function hasValue(value) {
  const text = String(value || "").trim();
  return Boolean(text) && text !== "-" && text !== "—";
}

function normalizeRows(rows = []) {
  return rows.filter((row) => Array.isArray(row) && hasValue(row[0]) && hasValue(row[1]));
}

function renderValueNode(label, value) {
  const text = String(value || "");
  const isEmail = (label === "From" || label === "Email") && text.includes("@");
  const isUrl = (label === "Website" || label === "Page") && text.startsWith("http");

  if (isEmail) {
    return React.createElement("a", { href: `mailto:${text}`, style: LINK_STYLE }, text);
  }

  if (isUrl) {
    return React.createElement("a", { href: text, style: LINK_STYLE }, text);
  }

  return React.createElement("span", { style: VALUE_STYLE }, text);
}

function renderRowsCard(key, title, rows) {
  const normalizedRows = normalizeRows(rows);
  if (!normalizedRows.length) return null;

  return React.createElement(
    "div",
    { key, style: { ...CARD_STYLE, marginBottom: "14px" } },
    [
      React.createElement("div", { key: "title", style: SECTION_TITLE_STYLE }, title),
      ...normalizedRows.map(([label, value], index) =>
        React.createElement(
          "div",
          {
            key: `${label}-${index}`,
            style: {
              display: "flex",
              gap: "14px",
              padding: "8px 0",
              borderBottom: index === normalizedRows.length - 1 ? "none" : "1px solid #f3f4f6",
            },
          },
          React.createElement("div", { style: ROW_LABEL_STYLE }, `${label}:`),
          React.createElement("div", { style: VALUE_STYLE }, renderValueNode(label, value))
        )
      ),
    ]
  );
}

function renderMessageCard(key, title, message) {
  if (!hasValue(message)) return null;

  return React.createElement(
    "div",
    { key, style: CARD_STYLE },
    [
      React.createElement("div", { key: "title", style: SECTION_TITLE_STYLE }, title),
      React.createElement("p", { key: "body", style: MESSAGE_BODY_STYLE }, safe(message, "")),
    ]
  );
}

export default function supportTeamTpl({
  name,
  email,
  message,
  topic,
  category,
  website,
  pageUrl,
  title,
  preview,
  intro,
  details = [],
  detailsTitle = "Selected details",
  messageTitle = "Message",
}) {
  const finalTopic = safe(topic, "General");
  const finalTitle = safe(title, "New Support Ticket");
  const finalPreview = safe(preview, "A new message was submitted.");

  const blocks = [];
  if (hasValue(intro)) {
    blocks.push(
      React.createElement("p", { key: "intro", style: INTRO_STYLE }, safe(intro, ""))
    );
  }

  blocks.push(
    renderRowsCard("overview", "Request overview", [
      ["Name", safe(name, "")],
      ["From", safe(email, "")],
      ["Topic", safe(topic, "General")],
      ["Category", safe(category, "")],
      ["Website", safe(website, "")],
      ["Page", safe(pageUrl, "")],
    ])
  );
  blocks.push(renderRowsCard("details", detailsTitle, details));
  blocks.push(renderMessageCard("message", messageTitle, message));

  return {
    subject: `ThreatNest - ${finalTopic}`,
    react: React.createElement(EmailBase, { title: finalTitle, preview: finalPreview }, blocks.filter(Boolean)),
  };
}
