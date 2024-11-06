#!/bin/bash

# Tornar scripts executáveis
chmod +x backup.sh
chmod +x backup.config

# Configurar timezone
TZ=$(grep TIMEZONE backup.config | cut -d= -f2 | tr -d '"')
export TZ

# Criar entrada no crontab para executar backup às 04:00 GMT-3
(crontab -l 2>/dev/null; echo "0 4 * * * $(pwd)/backup.sh") | crontab -

echo "Backup automático instalado com sucesso!"
echo "Será executado todos os dias às 04:00 (GMT-3)"
echo "Backup FULL aos domingos, INCREMENTAL nos demais dias"
echo "Os backups serão mantidos por 90 dias"
echo "Para verificar a programação, use: crontab -l"