FROM node:22-slim AS compilacion

WORKDIR /app/backend

COPY backend/package.json backend/package-lock.json ./
RUN npm ci

COPY backend/tsconfig.json backend/tsconfig.build.json ./
COPY backend/src ./src
COPY backend/scripts ./scripts
RUN npm run build

FROM node:22-slim

WORKDIR /app/backend

COPY backend/package.json backend/package-lock.json ./
RUN npm ci --omit=dev

COPY --from=compilacion /app/backend/dist ./dist
COPY database /app/database

RUN mkdir -p uploads && chown node:node uploads
USER node

ENV NODE_ENV=production
EXPOSE 3000

HEALTHCHECK --interval=5s --timeout=3s --start-period=20s --retries=10 \
  CMD node -e "fetch('http://localhost:3000/api/salud').then((r) => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"

CMD ["sh", "-c", "node dist/scripts/preparar.js && node dist/src/index.js"]
