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

RUN npm install -g tsx prisma

# Create uploads directory
RUN mkdir -p uploads

ENV NODE_ENV=production
ENV PORT=8080
ENV SERVER_PORT=8080

EXPOSE 8080

# Run DB migrations then start server
CMD ["sh", "-c", "prisma db push && tsx server/index.ts"]
