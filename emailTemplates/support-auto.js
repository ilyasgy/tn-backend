import React from "react";
import EmailBase, { safe } from "./base.js";

const CARD_STYLE = {
  background: "#ffffff",
  border: "1px solid #e5e7eb",
  borderRadius: "14px",
  padding: "18px",
};

const HIGHLIGHT_STYLE = {
  background: "#f0fdf4",
  border: "1px solid #bbf7d0",
  borderRadius: "14px",
  padding: "16px 18px",
  marginBottom: "14px",
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
  width: "98px",
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
  lineHeight: 1.75,
};

const STEP_NUMBER_STYLE = {
  width: "28px",
  color: "#2563eb",
  fontWeight: 800,
  flexShrink: 0,
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
  const isEmail = label === "Email" && text.includes("@");
  const isUrl = label === "Website" && text.startsWith("http");

  if (isEmail) {
    return React.createElement("a", { href: `mailto:${text}`, style: LINK_STYLE }, text);
  }

  if (isUrl) {
    return React.createElement("a", { href: text, style: LINK_STYLE }, text);
  }

  return React.createElement("span", { style: VALUE_STYLE }, safe(text));
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
    { key, style: { ...CARD_STYLE, marginBottom: "14px" } },
    [
      React.createElement("div", { key: "title", style: SECTION_TITLE_STYLE }, title),
      React.createElement("p", { key: "body", style: MESSAGE_BODY_STYLE }, safe(message, "")),
    ]
  );
}

function renderStepsCard(key, title, steps = []) {
  const items = steps.filter((step) => hasValue(step));
  if (!items.length) return null;

  return React.createElement(
    "div",
    { key, style: CARD_STYLE },
    [
      React.createElement("div", { key: "title", style: SECTION_TITLE_STYLE }, title),
      ...items.map((step, index) =>
        React.createElement(
          "div",
          {
            key: `${index}-${step}`,
            style: {
              display: "flex",
              gap: "12px",
              padding: "8px 0",
              borderBottom: index === items.length - 1 ? "none" : "1px solid #f3f4f6",
            },
          },
          React.createElement(
            "div",
            { style: STEP_NUMBER_STYLE },
            String(index + 1).padStart(2, "0")
          ),
          React.createElement("div", { style: VALUE_STYLE }, safe(step, ""))
        )
      ),
    ]
  );
}

export default function supportAutoTpl({
  name,
  email,
  website,
  message,
  title,
  preview,
  intro,
  subject,
  summary,
  details = [],
  detailsTitle = "Request details",
  nextSteps = [],
  messageTitle = "Message",
}) {
  const finalTitle = safe(title, "Message received");
  const finalPreview = safe(preview, "We got your message and will reply within one business day.");
  const finalIntro = safe(
    intro,
    "Thanks for contacting ThreatNest. We received your message and usually reply within one business day."
  );
  const finalSubject = safe(subject, "We received your message - ThreatNest");

  const blocks = [
    React.createElement("p", { key: "intro", style: INTRO_STYLE }, finalIntro),
  ];

  if (hasValue(summary)) {
    blocks.push(
      React.createElement(
        "div",
        { key: "summary", style: HIGHLIGHT_STYLE },
        React.createElement("p", { style: { margin: 0, color: "#166534", fontWeight: 700 } }, safe(summary, ""))
      )
    );
  }

  blocks.push(
    renderRowsCard("overview", "Request overview", [
      ["Name", safe(name)],
      ["Email", safe(email, "")],
      ["Website", safe(website, "")],
    ])
  );
  blocks.push(renderRowsCard("details", detailsTitle, details));
  blocks.push(renderMessageCard("message", messageTitle, message));
  blocks.push(renderStepsCard("steps", "What happens next", nextSteps));

  return {
    subject: finalSubject,
    react: React.createElement(EmailBase, { title: finalTitle, preview: finalPreview }, blocks.filter(Boolean)),
  };
}
