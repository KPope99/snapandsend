# Stage 1: Build frontend + generate Prisma client
FROM node:20-slim AS builder

RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .

# Build frontend
RUN npm run build

# Generate Prisma client at build time (avoids slow runtime generation)
RUN npx prisma generate

# Stage 2: Production image
FROM node:20-slim

RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server ./server
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/tsconfig*.json ./
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

RUN npm install -g tsx

ENV NODE_ENV=production
ENV PORT=8080
ENV SERVER_PORT=8080

EXPOSE 8080

# Create persistent dirs at startup (/home is mounted as Azure persistent storage)
# DATABASE_URL is set via Azure App Service environment variable
CMD ["sh", "-c", "mkdir -p /home/data /home/uploads && npx prisma db push --skip-generate && tsx server/scripts/init-db.ts && tsx server/index.ts"]
