@echo off
echo Iniciando deploy com Docker Compose...

REM Verificar se o arquivo .env existe
if not exist ".env" (
    echo Arquivo .env nao encontrado!
    echo Por favor, crie o arquivo .env com as variaveis necessarias.
    pause
    exit /b 1
)

REM Parar containers existentes
echo Parando containers existentes...
docker-compose down

REM Remover imagens antigas
echo Removendo imagens antigas...
docker-compose rm -f

REM Construir novas imagens
echo Construindo novas imagens...
docker-compose build --no-cache

REM Iniciar os serviços
echo Iniciando servicos...
docker-compose up -d

REM Verificar status
echo Verificando status dos servicos...
docker-compose ps

echo Deploy concluido!
pause