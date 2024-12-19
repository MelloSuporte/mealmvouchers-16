#!/bin/bash

# Carregar variáveis de ambiente
source ../.env

# Criar diretório de backup se não existir
mkdir -p ../supabase/backups/rls

# Obter data e hora atual para nome do arquivo
datetime=$(date +"%Y%m%d_%H%M%S")

# Nome do arquivo de backup
backup_file="../supabase/backups/rls/rls_policies_backup_$datetime.sql"

# Exibir mensagem de início
echo "Iniciando backup das políticas RLS..."
echo "Data e hora: $datetime"
echo "Arquivo de destino: $backup_file"

# Executar pg_dump para criar backup apenas das políticas RLS
PGPASSWORD=$POSTGRES_PASSWORD pg_dump \
    --host=$POSTGRES_HOST \
    --port=$POSTGRES_PORT \
    --username=$POSTGRES_USER \
    --dbname=$POSTGRES_DB \
    --schema=public \
    --section=pre-data \
    --section=post-data \
    --no-owner \
    --no-privileges \
    --format=plain \
    --file="$backup_file" \
    --schema=public \
    --exclude-schema=auth \
    --exclude-schema=storage \
    --exclude-table=schema_migrations \
    --exclude-table-data=* \
    --no-tablespaces \
    --no-unlogged-table-data \
    --no-publications \
    --no-subscriptions \
    --no-security-labels \
    --no-synchronized-snapshots \
    --no-table-access-method

# Verificar se o backup foi bem-sucedido
if [ $? -eq 0 ]; then
    echo "Backup das políticas RLS concluído com sucesso!"
    echo "Arquivo salvo em: $backup_file"
else
    echo "Erro ao criar backup das políticas RLS!"
    exit 1
fi

# Criar arquivo de log
echo "Backup das políticas RLS realizado em: $(date)" > "../supabase/backups/rls/backup_log.txt"
echo "Arquivo: $backup_file" >> "../supabase/backups/rls/backup_log.txt"
echo "Status: Sucesso" >> "../supabase/backups/rls/backup_log.txt"
echo >> "../supabase/backups/rls/backup_log.txt"

echo
echo "Backup finalizado!"