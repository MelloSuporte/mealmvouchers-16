#!/bin/bash

# Carregar configurações
source backup.config

# Configurar logging
exec 1> >(logger -s -t $(basename $0)) 2>&1

# Criar diretórios necessários
mkdir -p "$BACKUP_DIR"
mkdir -p "$LOG_DIR"

# Função para logging
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_DIR/backup.log"
}

# Função de limpeza
cleanup_old_backups() {
    log "Iniciando limpeza de backups antigos..."
    find "$BACKUP_DIR" -name "backup_*.sql" -mtime +$RETENTION_DAYS -delete
    log "Limpeza concluída"
}

# Função principal de backup
do_backup() {
    local DATE=$(date +%Y%m%d_%H%M%S)
    local BACKUP_FILE="$BACKUP_DIR/backup_$DATE.sql"
    
    log "Iniciando backup do banco $DATABASE..."
    
    if docker exec $CONTAINER_NAME mysqldump -u$MYSQL_USER -p$MYSQL_PASSWORD $DATABASE > "$BACKUP_FILE"; then
        log "Backup concluído com sucesso: $BACKUP_FILE"
        log "Tamanho do backup: $(du -h "$BACKUP_FILE" | cut -f1)"
    else
        log "ERRO: Falha ao realizar backup"
        return 1
    fi
    
    # Compactar backup
    gzip -f "$BACKUP_FILE"
    log "Backup compactado: $BACKUP_FILE.gz"
}

# Execução principal
log "Iniciando processo de backup"
do_backup
cleanup_old_backups
log "Processo de backup finalizado"