#!/bin/bash
BACKUP_DIR="./mysql-backups"
MYSQL_USER="voucher"
MYSQL_PASSWORD="Mysql*voucher"
DATABASE="sis_voucher"
DATE=$(date +%Y%m%d_%H%M%S)

# Criar diretório de backup se não existir
mkdir -p $BACKUP_DIR

# Realizar backup
docker exec bd_voucher mysqldump -u$MYSQL_USER -p$MYSQL_PASSWORD $DATABASE > "$BACKUP_DIR/backup_$DATE.sql"

# Manter apenas os últimos 7 backups
ls -t $BACKUP_DIR/backup_*.sql | tail -n +8 | xargs -r rm

echo "Backup completed: backup_$DATE.sql"