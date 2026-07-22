import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import test from "node:test";
import { render } from "@react-email/render";
import paymentFailedTpl from "../emailTemplates/payment-failed.js";
import paymentSuccessTpl from "../emailTemplates/payment-success.js";
import supportAutoTpl from "../emailTemplates/support-auto.js";
import supportTeamTpl from "../emailTemplates/support-team.js";

const port = 4129;
const baseUrl = `http://127.0.0.1:${port}`;

test("email templates render valid content", async () => {
  const templates = [
    supportTeamTpl({
      name: "Test User",
      email: "test@example.com",
      website: "https://example.com",
      topic: "Audit request",
      category: "Security",
      message: "Please review the login flow.",
    }),
    supportAutoTpl({
      name: "Test User",
      email: "test@example.com",
      website: "https://example.com",
      message: "We received your request.",
    }),
    paymentSuccessTpl({ clientName: "Test User", amount: "2000 USD", orderId: "ORDER-1" }),
    paymentFailedTpl({ clientName: "Test User", orderId: "ORDER-1", reason: "Declined" }),
  ];

  for (const template of templates) {
    assert.ok(template.subject);
    assert.doesNotMatch(template.subject, /[\r\n]/);
    const html = await render(template.react);
    assert.match(html, /ThreatNest/);
    assert.doesNotMatch(html, /\[object Object\]/);
  }
});

async function waitForServer(child) {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    if (child.exitCode !== null) {
      throw new Error(`Server exited before becoming ready with code ${child.exitCode}`);
    }

    try {
      const response = await fetch(`${baseUrl}/health`);
      if (response.ok) return;
    } catch {}

    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  throw new Error("Server did not become ready");
}

test("API security and validation behavior", async (t) => {
  const child = spawn(process.execPath, ["server.js"], {
    cwd: process.cwd(),
    env: {
      ...process.env,
      PORT: String(port),
      NODE_ENV: "test",
      RESEND_API_KEY: "",
      SUPPORT_INBOX: "",
      SUPPORT_FROM: "",
      INTERNAL_KEY: "",
      SLACK_WEBHOOK_URL: "",
    },
    stdio: ["ignore", "pipe", "pipe"],
  });

  t.after(() => {
    if (child.exitCode === null) child.kill();
  });

  await waitForServer(child);

  const health = await fetch(`${baseUrl}/health`);
  assert.equal(health.status, 200);
  assert.equal(health.headers.get("x-powered-by"), null);
  assert.equal(health.headers.get("x-content-type-options"), "nosniff");
  assert.deepEqual(await health.json(), { ok: true, message: "API is running" });

  const options = await fetch(`${baseUrl}/api/support/options`);
  assert.equal(options.status, 200);
  assert.equal((await options.json()).options.length, 6);

  const badOrigin = await fetch(`${baseUrl}/health`, {
    headers: { Origin: "https://untrusted.example" },
  });
  assert.equal(badOrigin.status, 403);
  assert.deepEqual(await badOrigin.json(), { ok: false, error: "Origin not allowed." });

  const invalidJson = await fetch(`${baseUrl}/api/start/request`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "{",
  });
  assert.equal(invalidJson.status, 400);
  assert.deepEqual(await invalidJson.json(), { ok: false, error: "Invalid request." });

  const invalidWebsite = await fetch(`${baseUrl}/api/start/request`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      fullName: "Test User",
      email: "test@example.com",
      website: "javascript:alert(1)",
      needsDev: true,
    }),
  });
  assert.equal(invalidWebsite.status, 400);
  assert.deepEqual(await invalidWebsite.json(), {
    ok: false,
    error: "Website must be a valid HTTP or HTTPS URL.",
  });

  const invalidContactWebsite = await fetch(`${baseUrl}/api/support/ticket`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Test User",
      message: "Hello",
      website: "file:///etc/passwd",
    }),
  });
  assert.equal(invalidContactWebsite.status, 400);
  assert.deepEqual(await invalidContactWebsite.json(), {
    ok: false,
    error: "Website must be a valid HTTP or HTTPS URL.",
  });

  const missingRoute = await fetch(`${baseUrl}/missing`);
  assert.equal(missingRoute.status, 404);
  assert.deepEqual(await missingRoute.json(), { ok: false, error: "Not found." });
});
