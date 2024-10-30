# Use the official Bun image as base
FROM oven/bun:1-debian as builder

WORKDIR /app

# Install necessary build dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    python3 \
    && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package.json bun.lockb ./

# Install all dependencies
RUN bun install

# Copy the rest of the application
COPY . .

# Build the application
RUN bun run build

# Production stage
FROM oven/bun:1-debian

WORKDIR /app

# Copy package files and install only production dependencies
COPY package.json ./
COPY bun.lockb ./
RUN bun install --no-save

# Copy built application and config files
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/.env.example ./.env
COPY --from=builder /app/init.sql ./init.sql

# Set production environment
ENV NODE_ENV=production

# Expose application port
EXPOSE 5000

# Start the application
CMD ["bun", "run", "start"]