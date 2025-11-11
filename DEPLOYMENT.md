# Production Deployment Guide

This guide walks you through deploying the Dinner N’ Awards Night site to a live server with HTTPS, a payment gateway (Korapay), email, and optional object storage.

You can deploy either with Docker (recommended) or bare‑metal Node.js + PM2.

## Prerequisites

- Domain name and DNS control (A/AAAA pointing to your server)
- A Linux VM (Ubuntu 22.04+ recommended) or any server with public IP
- One of:
  - Docker Engine + Docker Compose v2
  - Node.js 20+, Corepack (for pnpm), build tools
- Production credentials:
  - Korapay LIVE secret (and public key if used client‑side)
  - SMTP provider credentials (e.g., Resend, Sendgrid, Mailgun, Postmark, Gmail App Password)
  - MongoDB connection (MongoDB Atlas recommended)
  - VAPID keys for Web Push
  - Strong `ADMIN_SECRET`

## Environment variables

Set these in a `.env` file on the server. Critical ones:

```
NODE_ENV=production
NEXT_PUBLIC_BASE_URL=https://your-domain.com

# Mongo
MONGODB_URI=your_mongodb_connection_string
MONGODB_DB=dinner

# Korapay
KORAPAY_SECRET_KEY=sk_live_xxx
# Optional if referenced in client code
KORAPAY_PUBLIC_KEY=pk_live_xxx

# SMTP (Nodemailer)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your_user
SMTP_PASS=your_password
TICKETS_FROM_EMAIL="Dinner Tickets <tickets@your-domain.com>"

# Admin auth
ADMIN_EMAIL=admin@your-domain.com
ADMIN_PASSWORD=change-me
ADMIN_SECRET=super-long-random-secret

# Optional: MinIO (if self-hosting gallery storage)
MINIO_ENDPOINT=minio
MINIO_PORT=9000
MINIO_USE_SSL=false
MINIO_ACCESS_KEY=miniouser
MINIO_SECRET_KEY=miniosecret
MINIO_BUCKET=gallery

# Web Push (VAPID)
VAPID_PUBLIC_KEY=...
VAPID_PRIVATE_KEY=...
NEXT_PUBLIC_VAPID_PUBLIC_KEY=...
VAPID_CONTACT=mailto:admin@your-domain.com
```

Important:
- `NEXT_PUBLIC_BASE_URL` must be your public HTTPS origin. Your payment provider will redirect to `${BASE_URL}/ticket-confirmation`.
- In your payment provider dashboard (Korapay), set your callback/redirect to `https://your-domain.com/ticket-confirmation`.

---

## Option A: Docker (recommended)

1) Copy project to server and create `.env` with production values above.

2) Build and start in detached mode:

```bash
docker compose up --build -d
```

- App: http(s)://your-domain.com (behind a reverse proxy; app container listens on 3000)
- MongoDB (if using the included service): exposed on 27017 on the host; for production use MongoDB Atlas instead and remove the local `mongo` service.
- MinIO (optional): API on 9000 and Console on 9001; protect behind HTTPS or use a managed storage like S3.

3) Reverse proxy with Nginx (TLS via Let’s Encrypt):

Install Nginx and Certbot, then use a server block like:

```nginx
server {
  listen 80;
  server_name your-domain.com;
  return 301 https://$host$request_uri;
}

server {
  listen 443 ssl http2;
  server_name your-domain.com;

  # Certs managed by Certbot
  ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

  location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;

    # WebSocket support
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
  }

  # Optional: cache static assets
  location ~* ^/_next/static/ { expires 7d; add_header Cache-Control "public, max-age=604800, immutable"; }
  location ~* ^/public/ { expires 7d; add_header Cache-Control "public, max-age=604800, immutable"; }
}
```

Then run Certbot:

```bash
sudo certbot --nginx -d your-domain.com
```

4) MinIO (optional):
- Log into Console (port 9001) and create the bucket named in `MINIO_BUCKET`.
- For production security, either:
  - Put MinIO behind Nginx with TLS, or
  - Use a managed bucket provider (S3/GCS) and adapt the code (swap `lib/minio.ts`).

5) Routine ops:

```bash
# See logs
docker compose logs -f app

# Restart app only
docker compose restart app

# Update to latest build
git pull
docker compose build app
docker compose up -d app
```

---

## Option B: Bare‑metal Node.js + PM2

1) Install Node 20+ and Corepack, then build and run:

```bash
corepack enable
pnpm install --frozen-lockfile
pnpm build
# Run in foreground (test):
pnpm start
```

2) Use PM2 for process management:

Create `ecosystem.config.js`:

```js
module.exports = {
  apps: [
    {
      name: "dna-app",
      script: "node",
      args: ".next/standalone/server.js",
      env: { NODE_ENV: "production", PORT: 3000 },
    },
  ],
};
```

Start and enable startup:

```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

3) Nginx reverse proxy

Use the same Nginx config as in the Docker section, pointing to `127.0.0.1:3000`.

---

## Korapay configuration checklist

- Dashboard: set redirect/callback to `https://your-domain.com/ticket-confirmation`.
- Live keys in `.env`: `KORAPAY_SECRET_KEY` (and `KORAPAY_PUBLIC_KEY` if used).
- If you test from a mobile device, ensure the checkout/redirect happens on the same domain.

## Email configuration

- Use a reputable SMTP (or Resend/Postmark) to avoid spam folders.
- For Gmail, use an App Password (not your regular password) and ensure `from` matches domain policies (SPF/DKIM recommended).

## HTTPS & permissions

- Camera-based QR scanning requires HTTPS (browsers block getUserMedia on insecure origins). Localhost is an exception only for development.
- Push notifications also require HTTPS.

## Backups & data

- Prefer MongoDB Atlas for automatic backups and replicas.
- If running Mongo in Docker, schedule `mongodump` and store dumps off‑server.
- If using MinIO, back up your object bucket or use a managed provider.

## Observability & troubleshooting

- App logs: `docker compose logs -f app` or `pm2 logs`
- Common issues:
  - "This site can’t be reached" after payment → app not listening on 3000 or wrong `NEXT_PUBLIC_BASE_URL`. Ensure server is up and URL uses your domain with HTTPS.
  - Verify failing → wrong Korapay key or reference missing; check server logs in `/api/korapay/verify`.
  - Scanner not working → page not served over HTTPS or camera permission denied.
  - Email not delivered → SMTP credentials wrong or sender domain not authorized; set SPF/DKIM.
  - Static assets 404/502 behind Nginx → check proxy headers and that Next.js is running.

## Security hardening

- Use a long random `ADMIN_SECRET`; change default admin password.
- Ensure cookies are secure (production uses `secure: true`).
- Restrict access to admin pages via middleware (already enforced) and consider IP allow‑lists for broadcast/reminders endpoints.
- Keep dependencies updated and rebuild regularly.

---

## Quick verification checklist

- [ ] App reachable at your domain over HTTPS
- [ ] Korapay test (live mode) completes and redirects to `/ticket-confirmation`
- [ ] Email ticket received (with QR/PDF/ICS)
- [ ] Admin login works
- [ ] Scanner works over HTTPS
- [ ] Gallery uploads (if enabled) and push notifications (if configured)
