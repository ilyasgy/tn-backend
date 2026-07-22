import React from "react";
import EmailBase from "./base.js";

export default function paymentFailedTpl({ clientName, orderId, reason }) {
  const safe = (v, dash = "—") => (v && String(v).trim() ? String(v).trim() : dash);

  return {
    subject: "Payment failed — action required",
    react: React.createElement(
      EmailBase,
      { title: "Payment failed", preview: "Your payment didn’t go through. Please retry." },
      [
        React.createElement(
          "p",
          { key: 1, style: { margin: "0 0 12px" } },
          `Hi ${safe(clientName, "there")}, your payment didn’t go through.`
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
            React.createElement("span", { style: { color: "rgba(255,255,255,0.65)" } }, "Reason"),
            React.createElement("span", null, safe(reason, "Your bank/payment method rejected the transaction."))
          )
        ),

        React.createElement(
          "p",
          { key: 3, style: { margin: "0 0 12px" } },
          "Please retry the payment. If you believe this is an error, reply to this email and we’ll respond within one business day."
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
