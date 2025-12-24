import React from "react";
import EmailBase, { safe } from "./base.js";

export default function paymentSuccessTpl({ clientName, amount, orderId }) {
  const safe = (v, dash = "—") => (v && String(v).trim() ? String(v).trim() : dash);

  return {
    subject: "Payment received — we’re starting your work",
    react: React.createElement(
      EmailBase,
      { title: "Payment received", preview: "Thanks — we’re starting your work shortly." },
      [
        React.createElement(
          "p",
          { key: 1, style: { margin: "0 0 12px" } },
          `Hi ${safe(clientName, "there")}, we received your payment. We’re starting your work shortly.`
        ),

        React.createElement(
          "div",
          {
            key: 2,
            style: {
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "12px",
              padding: "14px",
              marginBottom: "12px",
            },
          },
          React.createElement(
            "div",
            { style: { display: "flex", justifyContent: "space-between", marginBottom: "8px" } },
            React.createElement("span", { style: { color: "rgba(255,255,255,0.65)" } }, "Order ID"),
            React.createElement("span", null, safe(orderId))
          ),
          React.createElement(
            "div",
            { style: { display: "flex", justifyContent: "space-between" } },
            React.createElement("span", { style: { color: "rgba(255,255,255,0.65)" } }, "Amount"),
            React.createElement("span", null, safe(amount))
          )
        ),

        React.createElement(
          "p",
          { key: 3, style: { margin: "0 0 12px" } },
          "If we need any additional info (like a test account for a login flow), we’ll email you."
        ),
        React.createElement(
          "p",
          { key: 4, style: { margin: 0, color: "rgba(255,255,255,0.75)" } },
          "— ThreatNest"
        ),
      ]
    ),
  };
}
