# Supabase Schema Management

Este diretório contém scripts e arquivos para gerenciamento do schema do banco de dados no Supabase Studio.

## Estrutura de Diretórios

```
mealmvouchers-03/supabase/
├── scripts/         # Scripts de backup
├── backups/         # Arquivos de backup gerados
├── migrations/      # Arquivos de migração do schema
└── import_schema.bat # Script para importação do schema
```

## Configuração

### 1. Criar Estrutura de Diretórios

Crie manualmente as seguintes pastas se não existirem:
```bash
mealmvouchers-03/supabase/scripts
mealmvouchers-03/supabase/backups
```

### 2. Configurar Variáveis de Ambiente

No arquivo `.env` na raiz do projeto, configure as seguintes variáveis:

```env
# Configurações originais do .env
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_DB=postgres

# Configurações atualizadas para Supabase Studio local
PGHOST=postgresql
PGPORT=6543
PGUSER=postgres.bh
PGPASSWORD=Voucher#2024@
PGDATABASE=postgresql
```

## Scripts Disponíveis

### Backup do Schema

Para criar um backup do schema atual:

```batch
cd supabase/scripts
backup_schema.bat
```

O backup será salvo em `supabase/backups` com um timestamp.

### Importar Schema

Para importar o schema no Supabase Studio:

```batch
cd supabase
import_schema.bat
```

## Acesso ao Supabase Studio

Após a importação bem-sucedida:
1. Aguarde alguns segundos para o serviço inicializar
2. Acesse o Supabase Studio em: http://localhost:3000

## Troubleshooting

Se encontrar erros durante a importação, verifique:

1. PostgreSQL está instalado e no PATH do sistema
2. Supabase Studio está rodando (`docker ps` para verificar)
3. Credenciais no arquivo `.env` estão corretas
4. Portas configuradas não estão em uso por outros serviços

## Notas Importantes

- O script de importação usa as credenciais do Supabase Studio local
- Backups são salvos com timestamp para evitar sobrescrita
- As políticas RLS (Row Level Security) são recriadas durante a importação
- O schema inclui todas as tabelas necessárias para o sistema de vouchers
