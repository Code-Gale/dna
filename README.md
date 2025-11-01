# Dinner N’ Awards Night — The Great Banquet

A responsive, animated event website built with Next.js 16 + TailwindCSS, with Paystack payments, MongoDB ticketing, QR e-tickets, and a simple admin dashboard.

## What’s inside
- Landing page with countdown and live tickets progress
- Ticket purchase flow with Paystack
- Early-bird pricing (₦5,000) until Nov 21, 2025, then regular (₦7,500)
- MongoDB-backed tickets (max 100, capacity enforced)
- E-ticket generation with QR codes and email via Nodemailer (SMTP)
- Admin dashboard: sales stats, list, CSV export, and check-in

## Setup
1. Copy `.env.example` to `.env.local` and fill values:
```
NEXT_PUBLIC_BASE_URL=http://localhost:3000
MONGODB_URI=...
PAYSTACK_SECRET_KEY=...
SMTP_HOST=...
SMTP_PORT=587
SMTP_USER=...
SMTP_PASS=...
TICKETS_FROM_EMAIL="Dinner Tickets <tickets@example.com>"
```

2. Install deps and run (Node 18+ recommended):
```
pnpm install
pnpm dev
```

If `pnpm install` fails due to Corepack on Windows, you can try:
```
corepack disable
npm install
npm run dev
```

## Notes
- API routes run on the Node.js runtime for Mongoose/QR.
- Pricing and capacity are controlled by the `Setting` collection. On first run, defaults are created.
- After Paystack redirects back to `/ticket-confirmation?reference=...`, the app verifies the payment, creates tickets, emails them via SMTP (Nodemailer), and shows QR codes.

## Admin
Visit `/admin` to view stats, list tickets, export CSV, and check-in attendees by ticket ID (QR content).

## Docker

Run the whole stack (app + MongoDB + MinIO) with Docker:

1) Copy `.env.example` to `.env` and fill the values. For Docker, typical values are:

```
NEXT_PUBLIC_BASE_URL=http://localhost:3000
MONGODB_URI=mongodb://mongo:27017/dinner
MONGODB_DB=dinner
MINIO_ENDPOINT=minio
MINIO_PORT=9000
MINIO_USE_SSL=false
MINIO_ACCESS_KEY=miniouser
MINIO_SECRET_KEY=miniosecret
MINIO_BUCKET=gallery
```

2) Build and start:

- Using bash on Windows (your default):
	- `docker compose up --build`

This will start:
- App at http://localhost:3000
- MongoDB at mongodb://localhost:27017
- MinIO API at http://localhost:9000 and Console at http://localhost:9001 (login with the credentials you set)

3) First-time MinIO setup:
- Log into the MinIO console (http://localhost:9001) and create a bucket matching `MINIO_BUCKET` (e.g., `gallery`).

4) Admin login:
- Default credentials from `.env`: `ADMIN_EMAIL` / `ADMIN_PASSWORD`

Notes:
- The Dockerfile uses the Next.js standalone output for a slimmer runtime image.
- Ensure SMTP and Paystack keys are configured in `.env` before real transactions.

## Production deployment

For an end‑to‑end live server setup (HTTPS, Nginx reverse proxy, Paystack callback, Docker and PM2 options), see `DEPLOYMENT.md`.
