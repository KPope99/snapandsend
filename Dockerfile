# Stage 1: Build frontend
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Stage 2: Production image
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server ./server
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/tsconfig*.json ./

# Install tsx globally (use project's local prisma, not global)
RUN npm install -g tsx

# Generate Prisma client using project's local prisma
RUN npx prisma generate

# Create uploads and data directories
RUN mkdir -p uploads data

ENV NODE_ENV=production
ENV PORT=8080
ENV SERVER_PORT=8080
ENV DATABASE_URL="file:/app/data/prod.db"

EXPOSE 8080

# Run DB migrations with local prisma then start server
CMD ["sh", "-c", "npx prisma db push && tsx server/index.ts"]
