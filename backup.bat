@echo off
setlocal enabledelayedexpansion

REM Carregar configurações
call backup.config

REM Criar diretórios necessários
if not exist "%BACKUP_DIR%" mkdir "%BACKUP_DIR%"
if not exist "%LOG_DIR%" mkdir "%LOG_DIR%"

REM Função para logging
:log
echo [%date% %time%] %~1 >> "%LOG_DIR%\backup.log"
echo [%date% %time%] %~1

REM Verificar se é domingo (dia do backup full)
for /f %%i in ('powershell $([datetime]::Now.DayOfWeek)') do set DOW=%%i
if "%DOW%"=="Sunday" (
    set BACKUP_TYPE=full
) else (
    set BACKUP_TYPE=incremental
)

REM Função principal de backup
:do_backup
set DATE=%date:~6,4%%date:~3,2%%date:~0,2%_%time:~0,2%%time:~3,2%%time:~6,2%
set DATE=%DATE: =0%
set BACKUP_FILE=%BACKUP_DIR%\backup_%BACKUP_TYPE%_%DATE%.sql

call :log "Iniciando backup %BACKUP_TYPE% do banco %DATABASE%..."

if "%BACKUP_TYPE%"=="full" (
    docker exec %CONTAINER_NAME% pg_dump -U%POSTGRES_USER% -d %DATABASE% > "%BACKUP_FILE%"
) else (
    docker exec %CONTAINER_NAME% pg_dump -U%POSTGRES_USER% -d %DATABASE% --exclude-table-data="*" --data-only --inserts --rows-per-insert=100 > "%BACKUP_FILE%"
)

if %ERRORLEVEL% EQU 0 (
    call :log "Backup %BACKUP_TYPE% concluído com sucesso: %BACKUP_FILE%"
    powershell Compress-Archive -Path "%BACKUP_FILE%" -DestinationPath "%BACKUP_FILE%.zip" -Force
    del "%BACKUP_FILE%"
    call :log "Backup compactado: %BACKUP_FILE%.zip"
) else (
    call :log "ERRO: Falha ao realizar backup %BACKUP_TYPE%"
    exit /b 1
)

REM Limpeza de backups antigos
:cleanup_old_backups
call :log "Iniciando limpeza de backups antigos..."
forfiles /P "%BACKUP_DIR%" /M backup_*.zip /D -%RETENTION_DAYS% /C "cmd /c del @path" 2>nul
call :log "Limpeza concluída"

exit /b 0