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
    {
      // ✅ remove the dark “shape” behind the email
      // Most email clients render on white anyway; this avoids forcing a dark backdrop.
      style: { background: "#f8f7f4", padding: "0", margin: "0" },
    },

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

    // outer padding wrapper (gives breathing room in inbox)
    React.createElement(
      "div",
      { style: { padding: "24px 12px" } },

      // ✅ main white card like your Figma
      React.createElement(
        "div",
        {
          style: {
            maxWidth: "640px",
            margin: "0 auto",
            background: "#ffffff",
            border: "1px solid #e5e7eb", // gray-200
            borderRadius: "14px",
            overflow: "hidden",
            boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
            fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial",
            color: "#111827", // gray-900
          },
        },

        // header (light)
        React.createElement(
          "div",
          {
            style: {
              padding: "18px 20px",
              borderBottom: "1px solid #e5e7eb",
              background: "#ffffff",
            },
          },
          React.createElement(
            "div",
            { style: { display: "flex", alignItems: "center", gap: "12px" } },

            // logo in a subtle badge so it’s always visible
            React.createElement(
              "div",
              {
                style: {
                  width: "44px",
                  height: "44px",
                  borderRadius: "10px",
                  border: "1px solid #e5e7eb",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "#ffffff",
                },
              },
              React.createElement("img", {
                src: BRAND.logo,
                width: 33,
                height: 33,
                alt: BRAND.name,
                style: { display: "block" },
              })
            ),

            React.createElement(
              "div",
              null,
              React.createElement(
                "div",
                { style: { fontWeight: 600, fontSize: "14px" } },
                `${BRAND.name} Support`
              ),
              React.createElement(
                "div",
                { style: { fontSize: "12px", color: "#6b7280" } }, // gray-500
                "Web development agency"
              )
            )
          )
        ),

        // body
        React.createElement(
          "div",
          { style: { padding: "22px 20px" } },
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

        // footer (light)
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
            { style: { marginTop: "8px", color: "#9ca3af" } }, // gray-400
            "If you did not request this email, ignore it."
          )
        )
      )
    )
  );
}

export default EmailBase;
