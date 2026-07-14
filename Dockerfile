# syntax=docker/dockerfile:1

FROM node:20-bookworm-slim AS deps
WORKDIR /app

RUN apt-get update \
  && apt-get install -y --no-install-recommends python3 make g++ \
  && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
COPY frontend/package.json ./frontend/
COPY backend/package.json ./backend/

RUN npm ci

FROM deps AS build
WORKDIR /app

COPY frontend ./frontend
COPY backend ./backend

ENV NODE_OPTIONS=--max-old-space-size=512

RUN npm run build \
  && npm run build:backend

FROM build AS prod-deps
WORKDIR /app
RUN npm prune --omit=dev

FROM node:20-bookworm-slim AS api
WORKDIR /app

RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates \
  && rm -rf /var/lib/apt/lists/* \
  && mkdir -p /app/db /app/uploads

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3001
ENV DATABASE_PATH=/app/db/production.sqlite3

COPY --from=prod-deps /app/package.json /app/package-lock.json ./
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=prod-deps /app/backend/package.json ./backend/
COPY --from=prod-deps /app/backend/dist ./backend/dist
COPY --from=prod-deps /app/backend/node_modules ./backend/node_modules

WORKDIR /app/backend
EXPOSE 3001
CMD ["node", "dist/index.js"]
