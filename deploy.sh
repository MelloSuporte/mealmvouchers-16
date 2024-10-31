#!/bin/bash

# Criar diretório de backups e definir permissões
mkdir -p mysql-backups
chmod 777 mysql-backups

# Copiar arquivo de ambiente se não existir
if [ ! -f .env ]; then
    cp .env.example .env
    echo "Arquivo .env criado a partir do .env.example"
fi

# Parar containers existentes e remover volumes órfãos
docker-compose down -v

# Limpar cache do Docker
docker system prune -f

# Reconstruir imagens sem usar cache
docker-compose build --no-cache

# Iniciar os containers
docker-compose up -d

# Aguardar banco de dados inicializar
echo "Aguardando banco de dados inicializar..."
sleep 30

# Instalar o cron de backup
chmod +x install-backup-cron.sh
./install-backup-cron.sh

echo "Deploy concluído! A aplicação está rodando."
echo "Acesse: http://localhost"