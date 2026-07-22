import React from "react";
import EmailBase from "./base.js";

export default function paymentSuccessTpl({ clientName, amount, orderId }) {
  const safe = (v, dash = "—") => (v && String(v).trim() ? String(v).trim() : dash);

  return {
    subject: "Payment received — next steps",
    react: React.createElement(
      EmailBase,
      { title: "Payment received", preview: "Thanks — we’ll confirm the remaining prerequisites within one business day." },
      [
        React.createElement(
          "p",
          { key: 1, style: { margin: "0 0 12px" } },
          `Hi ${safe(clientName, "there")}, we received your payment. We’ll confirm the remaining engagement prerequisites within one business day.`
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
          "Payment alone does not authorize testing. Testing begins only after scope, written authorization, the testing window, and required access are confirmed. If we need anything else, we’ll email you."
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
