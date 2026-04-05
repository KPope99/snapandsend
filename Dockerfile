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
RUN mkdir -p uploads data

ENV NODE_ENV=production
ENV PORT=8080
ENV SERVER_PORT=8080
ENV DATABASE_URL="file:/app/data/prod.db"

EXPOSE 8080

# Skip prisma generate at startup — already done at build time
CMD ["sh", "-c", "npx prisma db push --skip-generate && tsx server/index.ts"]
