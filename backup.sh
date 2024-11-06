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

# Função para verificar se é domingo (dia do backup full)
is_sunday() {
    [[ $(date +%u) -eq 7 ]]
}

# Função de limpeza
cleanup_old_backups() {
    log "Iniciando limpeza de backups antigos..."
    find "$BACKUP_DIR" -name "backup_*.sql.gz" -mtime +$RETENTION_DAYS -delete
    log "Limpeza concluída"
}

# Função principal de backup
do_backup() {
    local DATE=$(date +%Y%m%d_%H%M%S)
    local BACKUP_TYPE=$(is_sunday && echo "full" || echo "incremental")
    local BACKUP_FILE="$BACKUP_DIR/backup_${BACKUP_TYPE}_$DATE.sql"
    
    log "Iniciando backup $BACKUP_TYPE do banco $DATABASE..."
    
    if [ "$BACKUP_TYPE" = "full" ]; then
        # Backup completo
        docker exec $CONTAINER_NAME mysqldump -u$MYSQL_USER -p$MYSQL_PASSWORD $DATABASE > "$BACKUP_FILE"
    else
        # Backup incremental (apenas alterações desde o último backup)
        docker exec $CONTAINER_NAME mysqldump -u$MYSQL_USER -p$MYSQL_PASSWORD \
            --skip-add-drop-table \
            --no-create-info \
            --where="modified_at >= CURDATE()" \
            $DATABASE > "$BACKUP_FILE"
    fi
    
    if [ $? -eq 0 ]; then
        log "Backup $BACKUP_TYPE concluído com sucesso: $BACKUP_FILE"
        log "Tamanho do backup: $(du -h "$BACKUP_FILE" | cut -f1)"
        
        # Compactar backup
        gzip -f "$BACKUP_FILE"
        log "Backup compactado: $BACKUP_FILE.gz"
    else
        log "ERRO: Falha ao realizar backup $BACKUP_TYPE"
        return 1
    fi
}

# Execução principal
log "Iniciando processo de backup"
do_backup
cleanup_old_backups
log "Processo de backup finalizado"