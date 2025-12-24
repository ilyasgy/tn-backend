import React from "react";

const BRAND = {
  name: "ThreatNest",
  site: "https://threatnest.com",
  logo: "https://threatnest.com/assets/logo/threatnest-logo.png", // change to your real hosted logo URL
  supportEmail: "support@threatnest.com",
};

export default function EmailBase({ title, preview, children }) {
  return (
    <div style={{ background: "#0b0f14", padding: "28px 12px" }}>
      {/* Preheader (hidden preview text) */}
      <div style={{ display: "none", maxHeight: 0, overflow: "hidden", opacity: 0 }}>
        {preview || ""}
      </div>

      <div
        style={{
          maxWidth: "560px",
          margin: "0 auto",
          background: "#0f1620",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "14px",
          overflow: "hidden",
          boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
          fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial",
          color: "rgba(255,255,255,0.92)",
        }}
      >
        {/* Header */}
        <div style={{ padding: "18px 20px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <img
              src={BRAND.logo}
              width="34"
              height="34"
              alt={BRAND.name}
              style={{ borderRadius: "8px", display: "block" }}
            />
            <div>
              <div style={{ fontWeight: 700, fontSize: "14px", letterSpacing: "0.2px" }}>
                {BRAND.name} Support
              </div>
              <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.65)" }}>
                Security checks & web quality reviews
              </div>
            </div>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: "22px 20px" }}>
          <h2 style={{ margin: "0 0 12px", fontSize: "18px" }}>{title}</h2>
          <div style={{ fontSize: "14px", lineHeight: 1.7 }}>{children}</div>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "16px 20px",
            borderTop: "1px solid rgba(255,255,255,0.08)",
            fontSize: "12px",
            color: "rgba(255,255,255,0.6)",
          }}
        >
          <div>
            <a href={BRAND.site} style={{ color: "rgba(255,255,255,0.85)", textDecoration: "none" }}>
              {BRAND.site}
            </a>
            {" · "}
            <span>{BRAND.supportEmail}</span>
          </div>
          <div style={{ marginTop: "8px" }}>
            If you did not request this email, you can ignore it.
          </div>
        </div>
      </div>
    </div>
  );
}
