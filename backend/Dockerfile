# Backend Dockerfile — AI Lead Generation & Automated Outreach Platform
# Multi-stage build: builder (installs + compiles) -> runtime (production only)
# Build:  docker build -t outreach-backend -f Dockerfile .
# Run:    docker run -d -p 5000:5000 \\
#           -e RESEND_API_KEY=xxx \\
#           -e TWILIO_ACCOUNT_SID=xxx \\
#           -e TWILIO_AUTH_TOKEN=xxx \\
#           -e TWILIO_PHONE_NUMBER=xxx \\
#           -e PORT=5000 \\
#           outreach-backend

# ===== Builder stage ==========================================================
FROM node:22-alpine AS builder
WORKDIR /app

# Install pnpm + dumb-init
RUN apk add --no-cache pnpm dumb-init

# Copy backend source + config
COPY backend/package.json backend/tsconfig.json ./
COPY backend/server.ts ./
COPY backend/src ./src

# Install deps (including devDeps for tsc)
RUN pnpm install --no-frozen-lockfile

# Compile TypeScript -> dist/  (backend/package.json scripts.build = "tsc")
RUN pnpm build

# ===== Runtime stage ========================================================
FROM node:22-alpine
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

# Install only production deps (smaller image, no devDeps)
RUN apk add --no-cache dumb-init
RUN pnpm install --no-frozen-lockfile --prod

# Copy compiled output from builder
COPY --from=builder /app/dist ./dist

# Expose API port
EXPOSE 5000

# dumb-init forwards SIGTERM/SIGINT to the node process cleanly
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/server.js"]