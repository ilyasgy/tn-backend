# ThreatNest backend

Express API for ThreatNest contact, audit request, support notification, and payment status emails.

## Local setup

1. Copy `.env.example` to `.env`.
2. Fill in the required email settings.
3. Run `npm ci`.
4. Run `npm start`.

The API listens on port `4000` unless the deployment provides `PORT`.

## Required production settings

- `ALLOWED_ORIGINS`: comma separated frontend origins
- `RESEND_API_KEY`: Resend API credential
- `SUPPORT_INBOX`: address that receives website submissions
- `SUPPORT_FROM`: verified sender address
- `INTERNAL_KEY`: random value of at least 32 characters for the payment status endpoint

`SLACK_WEBHOOK_URL` is optional. Secrets belong in the hosting provider environment and must never be committed.

## Checks

Run `npm run check` before deployment. It verifies JavaScript syntax and exercises the public API behavior without sending email.
