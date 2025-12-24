import React from "react";
import { EmailBase, safe } from "./base.js";

export default function paymentSuccessTpl({ clientName, amount, orderId }) {
  return {
    subject: "Payment received — we’re starting soon",
    react: React.createElement(EmailBase, { title: "Payment received" }, [
      React.createElement(
        "p",
        { key: 1 },
        `Thanks ${safe(clientName, "there")}. We received your payment${amount ? ` (${amount})` : ""}.`
      ),
      React.createElement(
        "p",
        { key: 2 },
        "We’re starting your review now. If we need anything (like a test login or clarification), we’ll contact you by email."
      ),
      React.createElement("p", { key: 3 }, React.createElement("b", null, "Order ID: "), safe(orderId)),
      React.createElement("p", { key: 4, style: { marginTop: "16px" } }, "— ThreatNest"),
    ]),
  };
}
