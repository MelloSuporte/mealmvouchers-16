# Scripts de Deploy e Backup

Este diretório contém scripts para gerenciamento de deploy e backup do sistema.

## Arquivos

### 1. backup_supabase.bat
Script para realizar backup do banco de dados Supabase.

**Funcionalidades:**
- Backup completo do banco de dados
- Compactação do backup
- Upload para armazenamento remoto (opcional)
- Limpeza automática de backups antigos
- Logging de operações

**Uso:**
```batch
backup_supabase.bat
```

### 2. deploy_containers.bat
Script para realizar deploy dos containers Docker.

**Funcionalidades:**
- Backup automático antes do deploy
- Parada de containers existentes
- Build de novas imagens
- Inicialização de containers
- Verificação de saúde
- Rollback automático em caso de falha
- Logging de operações

**Uso:**
```batch
deploy_containers.bat
```

### 3. restore_backup.bat
Script para restaurar backup do banco de dados.

**Funcionalidades:**
- Lista backups disponíveis
- Extração do backup selecionado
- Restauração do banco de dados
- Reinicialização de containers
- Limpeza automática
- Logging de operações

**Uso:**
```batch
restore_backup.bat
```

## Pré-requisitos

1. Docker e Docker Compose instalados
2. PostgreSQL Client (psql) instalado
3. PowerShell 5.0 ou superior
4. Arquivo .env configurado na raiz do projeto

## Configuração

1. Certifique-se que o arquivo `.env` na raiz do projeto contenha:
```env
SUPABASE_DB_URL=postgresql://user:password@host:port/database
RCLONE_REMOTE=remote_name (opcional, para backup remoto)
```

2. Verifique as permissões de execução dos scripts

## Logs

Os scripts geram logs detalhados em:
- backup_log.txt
- deploy_log.txt
- restore_log.txt

## Backup Automático

Para configurar backup automático:

1. Abra o Agendador de Tarefas do Windows
2. Crie uma nova tarefa
3. Configure para executar backup_supabase.bat
4. Defina a frequência desejada

## Procedimentos de Emergência

### Em caso de falha no deploy:
1. O script tentará realizar rollback automático
2. Se o rollback falhar:
   ```batch
   restore_backup.bat
   ```

### Em caso de corrupção de dados:
1. Pare todos os containers:
   ```batch
   docker-compose down
   ```
2. Execute a restauração:
   ```batch
   restore_backup.bat
   ```

## Boas Práticas

1. Sempre verifique os logs após operações
2. Mantenha backups em local seguro
3. Teste restaurações periodicamente
4. Monitore o espaço em disco
5. Mantenha as credenciais seguras

## Troubleshooting

### Erro no Backup
1. Verifique conexão com Supabase
2. Confirme permissões do usuário
3. Verifique espaço em disco

### Erro no Deploy
1. Verifique logs dos containers
2. Confirme configurações do Docker
3. Verifique recursos do sistema

### Erro na Restauração
1. Verifique integridade do backup
2. Confirme conexão com banco
3. Verifique permissões
