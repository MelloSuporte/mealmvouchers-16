#!/bin/bash

# Create backups directory and set permissions
mkdir -p mysql-backups
chmod 777 mysql-backups

# Copy environment file if it doesn't exist
if [ ! -f .env ]; then
    cp .env.example .env
    echo "Environment file .env created from .env.example"
fi

# Stop existing containers and remove orphaned volumes
docker-compose down -v

# Clean Docker cache
docker system prune -f

# Rebuild images without cache
docker-compose build --no-cache

# Start containers
docker-compose up -d

echo "Deploy completed! Application is running."
echo "Access: http://localhost"