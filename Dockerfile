# syntax=docker/dockerfile:1
############################################################
# AI Lead Generation & Automated Outreach Platform — Backend
#
# Multi-stage build:
#   1) build  -> installs deps + compiles TypeScript (`tsc`) to dist/
#   2) runtime-> production-only deps + dist/, lean image
#
# Build:   docker build -t outreach-backend .
# Run:     docker run -d -p 5000:5000 outreach-backend
############################################################

FROM node:22-alpine AS build
WORKDIR /app

# Install ALL deps first (devDeps needed for `tsc`)
COPY backend/package.json ./
RUN npm install

# Compile TypeScript -> dist/
COPY backend/tsconfig.json ./
COPY backend/server.ts ./
COPY backend/src ./src
RUN npm run build

# ---------- runtime ----------
FROM node:22-alpine
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

# Production dependencies only (smaller image, no devDeps)
COPY backend/package.json ./
RUN npm install --omit=dev

# Compiled output from the build stage
COPY --from=build /app/dist ./dist

# API port
EXPOSE 5000

# Use tini as init so the container handles SIGTERM/SIGINT cleanly
RUN apk add --no-cache tini
ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "dist/server.js"]