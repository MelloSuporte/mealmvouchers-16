#!/bin/bash

# Verificar se o arquivo .env existe
if [ ! -f .env ]; then
    echo "Arquivo .env não encontrado!"
    echo "Por favor, crie o arquivo .env com as variáveis necessárias."
    exit 1
fi

# Parar containers existentes
echo "Parando containers existentes..."
docker-compose down

# Remover imagens antigas
echo "Removendo imagens antigas..."
docker-compose rm -f

# Construir novas imagens
echo "Construindo novas imagens..."
docker-compose build --no-cache

# Iniciar os serviços
echo "Iniciando serviços..."
docker-compose up -d

# Verificar status
echo "Verificando status dos serviços..."
docker-compose ps

echo "Deploy concluído!"