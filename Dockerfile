# Use Node.js 18 Alpine as base image
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy root package files
COPY package.json package-lock.json ./
# Install root dependencies
RUN npm ci --only=production

# Copy frontend package files
COPY frontend/package.json frontend/package-lock.json ./frontend/
# Install frontend dependencies
RUN cd frontend && npm ci --only=production

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app

# Copy root dependencies
COPY --from=deps /app/node_modules ./node_modules
# Copy frontend dependencies
COPY --from=deps /app/frontend/node_modules ./frontend/node_modules

# Copy source code
COPY . .

# Build backend
RUN npm run build:backend

# Build frontend
RUN npm run build:frontend

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

# Create a non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built backend
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma

# Copy built frontend
COPY --from=builder --chown=nextjs:nodejs /app/frontend/dist ./frontend/dist
COPY --from=builder --chown=nextjs:nodejs /app/frontend/public ./frontend/public
COPY --from=builder --chown=nextjs:nodejs /app/frontend/package.json ./frontend/package.json

# Copy root package.json for scripts
COPY --from=builder /app/package.json ./

USER nextjs

EXPOSE 3000

ENV PORT 3000

# Start the server
CMD ["npm", "start"]