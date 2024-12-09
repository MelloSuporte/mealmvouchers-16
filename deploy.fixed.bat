@echo off
setlocal enabledelayedexpansion

echo Iniciando deploy da aplicação...

:: Verificar se o Docker está rodando
docker info > nul 2>&1
if %errorlevel% neq 0 (
    echo [ERRO] Docker não está rodando! Por favor, inicie o Docker Desktop.
    exit /b 1
)

:: Backup dos arquivos de configuração atuais
echo Fazendo backup das configurações...
if exist "docker-compose.yml" (
    copy "docker-compose.yml" "docker-compose.yml.bak"
)
if exist "nginx.conf" (
    copy "nginx.conf" "nginx.conf.bak"
)

:: Copiar arquivos corrigidos
echo Aplicando configurações otimizadas...
copy "docker-compose.fixed.yml" "docker-compose.yml"
copy "nginx.fixed.conf" "nginx.conf"

:: Parar containers existentes
echo Parando containers existentes...
docker-compose down

:: Limpar cache do Docker
echo Limpando cache do Docker...
docker system prune -f

:: Construir e iniciar containers
echo Construindo e iniciando containers...
docker-compose up --build -d

:: Verificar status dos containers
echo Verificando status dos containers...
timeout /t 10 /nobreak > nul
docker-compose ps

:: Verificar logs por erros
echo Verificando logs por erros...
docker-compose logs --tail=50

echo.
echo Deploy concluído! Acesse a aplicação em http://localhost:3000
echo Para verificar os logs em tempo real, execute: docker-compose logs -f
echo.

endlocal
