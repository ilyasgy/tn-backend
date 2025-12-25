import React from "react";

export const BRAND = {
  name: "ThreatNest",
  site: "https://threatnest.com",
  logo: "https://threatnest.com/assets/logo/black.png",
  supportEmail: "support@threatnest.com",
};

export const safe = (v, dash = "—") =>
  v && String(v).trim() ? String(v).trim() : dash;

export function EmailBase({ title, preview, children }) {
  const kids = Array.isArray(children) ? children : [children];

  return React.createElement(
    "div",
    { style: { background: "#f8f7f4", padding: "0", margin: "0" } },

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
      { style: { padding: "24px 12px" } },

      React.createElement(
        "div",
        {
          style: {
            maxWidth: "640px",
            margin: "0 auto",
            background: "#ffffff",
            border: "1px solid #e5e7eb",
            borderRadius: "14px",
            overflow: "hidden",
            boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
            fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial",
            color: "#111827",
          },
        },

        React.createElement(
          "div",
          {
            style: {
              padding: "15px 17px",
              borderBottom: "1px solid #e5e7eb",
              background: "#ffffff",
            },
          },

          React.createElement(
            "div",
            { style: { display: "flex", alignItems: "center" } },

React.createElement(
  "div",
  {
    style: {
      width: "65px",
      height: "65px",
      borderRadius: "14px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "#ffffff",
      overflow: "hidden",
      marginRight: "1px",
    },
  },
  React.createElement("img", {
    src: BRAND.logo,
    alt: BRAND.name,
    width: 60,
    height: 60,
    style: {
      display: "block",
      width: "60px",
      height: "60px",
      objectFit: "contain",
      objectPosition: "center",
    },
  })
),



            React.createElement(
              "div",
              { style: { lineHeight: 1.2,
            marginTop: "6px", } },
              React.createElement(
                "div",
                {
                  style: {
                    fontWeight: 700,
                    fontSize: "14px",
                    marginBottom: "3px",
                  },
                },
                `${BRAND.name} Support`
              ),
              React.createElement(
                "div",
                { style: { fontSize: "12px", color: "#6b7280" } },
                "Web development agency"
              )
            )
          )
        ),

        React.createElement(
          "div",
          { style: { padding: "18px 20px" } },
          React.createElement(
            "h2",
            { style: { margin: "0 0 14px", fontSize: "18px", fontWeight: 800 } },
            title
          ),
          React.createElement(
            "div",
            { style: { fontSize: "14px", lineHeight: 1.7 } },
            ...kids
          )
        ),

        React.createElement(
          "div",
          {
            style: {
              padding: "16px 20px",
              borderTop: "1px solid #e5e7eb",
              fontSize: "12px",
              color: "#6b7280",
              background: "#ffffff",
            },
          },
          React.createElement(
            "div",
            null,
            React.createElement(
              "a",
              { href: BRAND.site, style: { color: "#111827", textDecoration: "none" } },
              BRAND.site
            ),
            " · ",
            React.createElement(
              "a",
              { href: `mailto:${BRAND.supportEmail}`, style: { color: "#2563eb", textDecoration: "none" } },
              BRAND.supportEmail
            )
          ),
          React.createElement(
            "div",
            { style: { marginTop: "8px", color: "#9ca3af" } },
            "If you did not request this email, ignore it."
          )
        )
      )
    )
  );
}

export default EmailBase;
