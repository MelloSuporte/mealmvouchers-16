@echo off
setlocal enabledelayedexpansion

echo Parando containers existentes...
docker-compose down

echo Removendo volumes e imagens antigas...
docker volume rm mealmvouchers-03_nginx_logs mealmvouchers-03_app_data
docker image prune -f

echo Aplicando configurações finais...
copy /y "Dockerfile.fixed2" "Dockerfile"
copy /y "docker-compose.fixed3.yml" "docker-compose.yml"

echo Reconstruindo e iniciando containers...
docker-compose up --build -d

echo Aguardando inicialização (10 segundos)...
ping -n 10 127.0.0.1 > nul

echo Verificando status dos containers...
docker-compose ps

echo Verificando logs por erros...
docker-compose logs --tail=50

echo.
echo Deploy concluído! Acesse a aplicação em http://localhost:3000
echo Para verificar os logs em tempo real, execute: docker-compose logs -f
echo.

endlocal
