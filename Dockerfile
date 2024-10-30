FROM oven/bun:1 as builder

WORKDIR /app

# Copy only package files first for better caching
COPY package.json bun.lockb ./

# Install dependencies
RUN bun install

# Copy the rest of the application
COPY . .

# Build the application
RUN bun run build

# Production stage
FROM oven/bun:1-slim

WORKDIR /app

# Copy package files and install production dependencies
COPY --from=builder /app/package.json /app/bun.lockb ./
RUN bun install --production

# Copy built application and config files
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/.env.example ./.env
COPY --from=builder /app/init.sql ./init.sql

# Set production environment
ENV NODE_ENV=production

# Expose application port
EXPOSE 5000

# Start the application
CMD ["bun", "dist/server.js"]