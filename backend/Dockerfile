FROM node:22-slim

WORKDIR /app/backend

COPY backend/package.json backend/package-lock.json ./
RUN npm ci --omit=dev

COPY backend/src ./src
COPY backend/scripts ./scripts
COPY database /app/database

ENV NODE_ENV=production
EXPOSE 3000

HEALTHCHECK --interval=5s --timeout=3s --start-period=20s --retries=10 \
  CMD node -e "fetch('http://localhost:3000/api/salud').then((r) => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"

CMD ["sh", "-c", "node scripts/preparar.js && node src/index.js"]
