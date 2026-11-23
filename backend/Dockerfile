# syntax=docker/dockerfile:1
FROM node:22-alpine AS base
WORKDIR /app
COPY package.json package-lock.json ./

# Test image: includes dev dependencies (jest, supertest).
# Used by docker-compose.test.yml.
FROM base AS test
RUN npm ci --no-audit --no-fund
COPY . .
CMD ["npm", "test"]

# Production image (default target): runtime dependencies only, non-root user.
FROM base AS production
ENV NODE_ENV=production
RUN npm ci --omit=dev --no-audit --no-fund && npm cache clean --force
COPY . .
USER node
EXPOSE 5000
HEALTHCHECK --interval=10s --timeout=3s --start-period=20s --retries=5 \
  CMD wget -qO- http://127.0.0.1:5000/api/health > /dev/null || exit 1
CMD ["node", "server.js"]
