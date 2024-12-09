@echo off
setlocal enabledelayedexpansion

REM Carregar variáveis de ambiente do arquivo .env
for /f "tokens=*" %%a in ('type .env ^| findstr /v /c:"#"') do (
    set "%%a"
)

REM Criar diretório de backup se não existir
if not exist ".\supabase\backups" mkdir ".\supabase\backups"

REM Obter data e hora atual para nome do arquivo
set "datetime=%date:~6,4%%date:~3,2%%date:~0,2%_%time:~0,2%%time:~3,2%%time:~6,2%"
set "datetime=%datetime: =0%"

REM Nome do arquivo de backup
set "backup_file=.\supabase\backups\schema_backup_%datetime%.sql"

REM Exibir mensagem de início
echo Iniciando backup do esquema do banco de dados...
echo Data e hora: %datetime%
echo Arquivo de destino: %backup_file%

REM Executar pg_dump para criar backup do esquema
pg_dump ^
    --host=%POSTGRES_HOST% ^
    --port=%POSTGRES_PORT% ^
    --username=%POSTGRES_USER% ^
    --dbname=%POSTGRES_DB% ^
    --schema-only ^
    --no-owner ^
    --no-privileges ^
    --format=plain ^
    --file="%backup_file%" ^
    --schema=public ^
    --exclude-schema=auth ^
    --exclude-schema=storage ^
    --exclude-table=schema_migrations

REM Verificar se o backup foi bem-sucedido
if %ERRORLEVEL% EQU 0 (
    echo Backup concluído com sucesso!
    echo Arquivo salvo em: %backup_file%
) else (
    echo Erro ao criar backup!
    exit /b 1
)

REM Criar arquivo de log
echo Backup realizado em: %date% %time% > ".\supabase\backups\backup_log.txt"
echo Arquivo: %backup_file% >> ".\supabase\backups\backup_log.txt"
echo Status: Sucesso >> ".\supabase\backups\backup_log.txt"
echo. >> ".\supabase\backups\backup_log.txt"

echo.
echo Backup finalizado! Pressione qualquer tecla para sair...
pause > nul
