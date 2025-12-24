import React from "react";
import { EmailBase, safe } from "./base.js";

export default function supportTeamTpl({ email, message, topic, website, pageUrl }) {
  return {
    subject: `Support Ticket — ${safe(topic, "General")}`,
    react: React.createElement(EmailBase, { title: "New Support Ticket" }, [
      React.createElement("p", { key: 1 }, React.createElement("b", null, "From: "), safe(email)),
      React.createElement("p", { key: 2 }, React.createElement("b", null, "Topic: "), safe(topic, "General")),
      React.createElement("p", { key: 3 }, React.createElement("b", null, "Website: "), safe(website)),
      React.createElement("p", { key: 4 }, React.createElement("b", null, "Page: "), safe(pageUrl)),
      React.createElement("hr", { key: 5 }),
      React.createElement("pre", { key: 6, style: { whiteSpace: "pre-wrap" } }, safe(message, "")),
    ]),
  };
}
