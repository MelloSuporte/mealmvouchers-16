#!/bin/bash

# Tornar scripts executáveis
chmod +x backup.sh
chmod +x backup.config

# Criar entrada no crontab para executar backup diariamente às 3 da manhã
(crontab -l 2>/dev/null; echo "0 3 * * * $(pwd)/backup.sh") | crontab -

echo "Backup programado instalado com sucesso!"
echo "O backup será executado todos os dias às 3:00 da manhã"
echo "Para verificar a programação, use: crontab -l"