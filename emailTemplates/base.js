import React from "react";

export function EmailBase({ title, children }) {
  return React.createElement(
    "div",
    { style: { fontFamily: "system-ui, Segoe UI, Roboto, Arial", lineHeight: 1.6, padding: "20px" } },
    React.createElement("h2", { style: { margin: "0 0 12px" } }, title),
    ...children
  );
}

export const safe = (v, fallback = "—") => (v && String(v).trim() ? String(v) : fallback);
