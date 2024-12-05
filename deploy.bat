@echo off

REM Create backups directory
mkdir postgres-backups 2>nul

REM Copy environment file if it doesn't exist
if not exist .env (
    copy .env.example .env
    echo Environment file .env created from .env.example
)

REM Stop existing containers and remove orphaned volumes
docker-compose down -v

REM Clean Docker cache
docker system prune -f

REM Rebuild images without cache
docker-compose build --no-cache

REM Start containers
docker-compose up -d

echo Deploy completed! Application is running.
echo Access: http://localhost