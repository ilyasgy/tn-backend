import React from "react";

export const BRAND = {
  name: "ThreatNest",
  site: "https://threatnest.com",
  logo: "https://threatnest.com/assets/logo/threatnest-logo.png",
  supportEmail: "support@threatnest.com",
};

export const safe = (v, dash = "—") =>
  v && String(v).trim() ? String(v).trim() : dash;

export function EmailBase({ title, preview, children }) {
  const kids = Array.isArray(children) ? children : [children];

  return React.createElement(
    "div",
    { style: { background: "#0b0f14", padding: "28px 12px" } },

    // preview text (hidden)
    React.createElement(
      "div",
      {
        style: {
          display: "none",
          maxHeight: 0,
          overflow: "hidden",
          opacity: 0,
          color: "transparent",
        },
      },
      preview || ""
    ),

    React.createElement(
      "div",
      {
        style: {
          maxWidth: "560px",
          margin: "0 auto",
          background: "#0f1620",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "14px",
          overflow: "hidden",
          boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
          fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial",
          color: "rgba(255,255,255,0.92)",
        },
      },

      // header
      React.createElement(
        "div",
        {
          style: {
            padding: "18px 20px",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
          },
        },
        React.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: "12px" } },
          React.createElement("img", {
            src: BRAND.logo,
            width: 34,
            height: 34,
            alt: BRAND.name,
            style: { borderRadius: "8px", display: "block" },
          }),
          React.createElement(
            "div",
            null,
            React.createElement(
              "div",
              { style: { fontWeight: 700, fontSize: "14px", letterSpacing: "0.2px" } },
              `${BRAND.name} Support`
            ),
            React.createElement(
              "div",
              { style: { fontSize: "12px", color: "rgba(255,255,255,0.65)" } },
              "Web development & website security"
            )
          )
        )
      ),

      // body
      React.createElement(
        "div",
        { style: { padding: "22px 20px" } },
        React.createElement("h2", { style: { margin: "0 0 12px", fontSize: "18px" } }, title),
        React.createElement("div", { style: { fontSize: "14px", lineHeight: 1.7 } }, ...kids)
      ),

      // footer
      React.createElement(
        "div",
        {
          style: {
            padding: "16px 20px",
            borderTop: "1px solid rgba(255,255,255,0.08)",
            fontSize: "12px",
            color: "rgba(255,255,255,0.6)",
          },
        },
        React.createElement(
          "div",
          null,
          React.createElement(
            "a",
            { href: BRAND.site, style: { color: "rgba(255,255,255,0.85)", textDecoration: "none" } },
            BRAND.site
          ),
          " · ",
          React.createElement("span", null, BRAND.supportEmail)
        ),
        React.createElement(
          "div",
          { style: { marginTop: "8px" } },
          "If you did not request this email, ignore it."
        )
      )
    )
  );
}

export default EmailBase;
