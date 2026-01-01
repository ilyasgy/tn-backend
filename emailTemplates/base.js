import React from "react";

export function safe(v, fallback = "—") {
  if (v === null || v === undefined) return fallback;
  const s = String(v).trim();
  return s.length ? s : fallback;
}

// Put your real, absolute URL here
const BRAND = {
  name: "ThreatNest",
  site: "https://threatnest.com",
  // MUST be absolute URL for email clients
  logo: "https://threatnest.com/icon0.svg",
};

export default function EmailBase({ title, preview, children }) {
  const outer = {
    background: "#f3f4f6", // gray-100
    padding: "28px 12px",
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  };

  const container = {
    maxWidth: "640px",
    margin: "0 auto",
  };

  const card = {
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "16px",
    overflow: "hidden",
    boxShadow: "0 1px 0 rgba(17,24,39,0.04)",
  };

  const header = {
    padding: "18px 18px 12px",
    borderBottom: "1px solid #f3f4f6",
    background: "#ffffff",
  };

  const brandRow = {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  };

  const logoStyle = {
    width: "36px",
    height: "36px",
    borderRadius: "10px",
    display: "block",
    objectFit: "contain",
    background: "#ffffff",
    border: "1px solid #eef2f7",
  };

  const titleStyle = {
    margin: "6px 0 0",
    fontSize: "16px",
    fontWeight: 800,
    color: "#111827",
    letterSpacing: "-0.01em",
  };

  const body = {
    padding: "18px",
    color: "#111827",
    fontSize: "14px",
    lineHeight: 1.7,
  };

  const footer = {
    padding: "14px 18px",
    borderTop: "1px solid #f3f4f6",
    color: "#6b7280",
    fontSize: "12px",
    lineHeight: 1.5,
  };

  // Preheader text (hidden in body, shown in inbox previews)
  const preheaderStyle = {
    display: "none",
    fontSize: "1px",
    color: "#f3f4f6",
    lineHeight: "1px",
    maxHeight: "0px",
    maxWidth: "0px",
    opacity: 0,
    overflow: "hidden",
  };

  return React.createElement(
    "div",
    { style: outer },
    React.createElement(
      "div",
      { style: container },
      React.createElement("div", { style: preheaderStyle }, safe(preview, "")),
      React.createElement(
        "div",
        { style: card },
        React.createElement(
          "div",
          { style: header },
          React.createElement(
            "div",
            { style: brandRow },
            React.createElement(
              "a",
              { href: BRAND.site, style: { textDecoration: "none" } },
              React.createElement("img", {
                src: BRAND.logo,
                width: 36,
                height: 36,
                alt: BRAND.name,
                style: logoStyle,
              })
            ),
            React.createElement(
              "div",
              null,
              React.createElement("div", { style: { fontSize: "13px", fontWeight: 800, color: "#111827" } }, BRAND.name),
              React.createElement(
                "div",
                { style: { fontSize: "12px", color: "#6b7280" } },
                safe(title, "")
              )
            )
          ),
          React.createElement("div", { style: titleStyle }, safe(title, ""))
        ),
        React.createElement("div", { style: body }, children),
        React.createElement(
          "div",
          { style: footer },
          "If you didn’t request this, you can ignore this email. ",
          React.createElement(
            "a",
            { href: BRAND.site, style: { color: "#2563eb", textDecoration: "none", fontWeight: 700 } },
            BRAND.site.replace("https://", "")
          )
        )
      )
    )
  );
}
