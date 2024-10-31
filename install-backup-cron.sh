#!/bin/bash

# Tornar scripts executáveis
chmod +x backup.sh
chmod +x backup.config

# Criar entrada no crontab para executar backup duas vezes ao dia
(crontab -l 2>/dev/null; echo "0 9,21 * * * $(pwd)/backup.sh") | crontab -

echo "Backup programado instalado com sucesso!"
echo "O backup será executado todos os dias às 09:00 e 21:00"
echo "Os backups serão mantidos por 90 dias"
echo "Para verificar a programação, use: crontab -l"