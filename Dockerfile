# Multi-stage Dockerfile for Next.js 16 app

# 1) Install dependencies
FROM node:20-alpine AS deps
WORKDIR /app
# Enable corepack and pnpm (since repo uses pnpm-lock.yaml)
RUN corepack enable
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# 2) Build the app
FROM node:20-alpine AS builder
WORKDIR /app
RUN corepack enable
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Build with standalone output (configured in next.config.mjs)
RUN pnpm build

# 3) Production runner image
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
# For Next.js standalone output
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
# If you load any runtime config files, copy them as well
# EXPOSE 3000
CMD ["node", "server.js"]
