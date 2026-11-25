# syntax=docker/dockerfile:1
FROM node:22-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY . .
# Vite inlines VITE_* variables into the public bundle at build time: never put a secret here.
ARG VITE_API_URL=http://localhost:5000/api
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

# Static files served by an unprivileged nginx (listens on 8080, non-root).
# The official image renders /etc/nginx/templates/*.template with envsubst at startup,
# which puts the API origin into the Content-Security-Policy (connect-src).
# Pinned by digest (stable-alpine, nginx 1.30.6); update deliberately.
FROM nginxinc/nginx-unprivileged:stable-alpine@sha256:f5116ed4606f3eb015dd4a8e28cb9b351476dc0ad4bc6e9f93b19cec130cdf03
ENV API_ORIGIN=http://localhost:5000
COPY nginx.conf.template /etc/nginx/templates/default.conf.template
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 8080
HEALTHCHECK --interval=15s --timeout=3s --retries=3 \
  CMD wget -qO- http://127.0.0.1:8080/ > /dev/null || exit 1
