@echo off

REM Criar diretório de backups e definir permissões
mkdir postgres-backups 2>nul

REM Copiar arquivo de ambiente se não existir
if not exist .env (
    copy .env.example .env
    echo Arquivo .env criado a partir do .env.example
)

REM Parar containers existentes e remover volumes órfãos
docker-compose down -v

REM Limpar cache do Docker
docker system prune -f

REM Reconstruir imagens sem usar cache
docker-compose build --no-cache

REM Iniciar os containers
docker-compose up -d

REM Aguardar banco de dados inicializar
echo Aguardando banco de dados inicializar...
timeout /t 30

REM Instalar o cron de backup
call install-backup-cron.bat

echo Deploy concluído! A aplicação está rodando.
echo Acesse: http://localhost