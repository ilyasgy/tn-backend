import React from "react";
import { EmailBase, safe } from "./base.js";

export default function paymentFailedTpl({ clientName, orderId, reason }) {
  return {
    subject: "Payment failed — action required",
    react: React.createElement(EmailBase, { title: "Payment failed" }, [
      React.createElement(
        "p",
        { key: 1 },
        `Hi ${safe(clientName, "there")}. Your payment did not go through, so we haven’t started yet.`
      ),
      React.createElement("p", { key: 2 }, React.createElement("b", null, "Order ID: "), safe(orderId)),
      React.createElement("p", { key: 3 }, React.createElement("b", null, "Reason: "), safe(reason, "—")),
      React.createElement(
        "p",
        { key: 4 },
        "Please try again or reply to this email and we’ll help you fix it."
      ),
      React.createElement("p", { key: 5, style: { marginTop: "16px" } }, "— ThreatNest"),
    ]),
  };
}
