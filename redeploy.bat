@echo off
setlocal enabledelayedexpansion

echo Parando containers existentes...
docker-compose down

echo Removendo imagens antigas...
docker image prune -f

echo Aplicando configurações corrigidas...
copy /y "nginx.fixed2.conf" "nginx.conf"
copy /y "Dockerfile.fixed" "Dockerfile"
copy /y "docker-compose.fixed2.yml" "docker-compose.yml"

echo Reconstruindo e iniciando containers...
docker-compose up --build -d

echo Aguardando inicialização...
timeout /t 10 /nobreak

echo Verificando status dos containers...
docker-compose ps

echo Verificando logs por erros...
docker-compose logs --tail=50

echo.
echo Acesse a aplicação em http://localhost:3000
echo Para verificar os logs em tempo real, execute: docker-compose logs -f

endlocal
