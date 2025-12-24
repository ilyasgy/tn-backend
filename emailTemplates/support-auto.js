import React from "react";
import { EmailBase, safe } from "./base.js";

export default function supportAutoTpl({ message }) {
  return {
    subject: "We received your message — ThreatNest",
    react: React.createElement(EmailBase, { title: "Message received" }, [
      React.createElement(
        "p",
        { key: 1 },
        "Thanks for contacting ThreatNest. We received your message and will reply as soon as possible (usually within 24 hours)."
      ),
      React.createElement("p", { key: 2, style: { marginTop: "16px" } }, React.createElement("b", null, "Your message:")),
      React.createElement("pre", { key: 3, style: { whiteSpace: "pre-wrap" } }, safe(message, "")),
      React.createElement("p", { key: 4, style: { marginTop: "16px" } }, "— ThreatNest Support"),
    ]),
  };
}
