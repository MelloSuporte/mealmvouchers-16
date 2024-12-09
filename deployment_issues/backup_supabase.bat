@echo off
setlocal enabledelayedexpansion

:: Configurações
set BACKUP_DIR=backups
set TIMESTAMP=%DATE:~6,4%%DATE:~3,2%%DATE:~0,2%_%TIME:~0,2%%TIME:~3,2%%TIME:~6,2%
set TIMESTAMP=!TIMESTAMP: =0!
set LOG_FILE=backup_log.txt

:: Carregar variáveis de ambiente do arquivo .env
for /f "tokens=*" %%a in ('type ..\.env') do (
    set %%a
)

:: Criar diretório de backup se não existir
if not exist %BACKUP_DIR% mkdir %BACKUP_DIR%

echo [%DATE% %TIME%] Iniciando backup do Supabase >> %LOG_FILE%

:: Backup do banco de dados
echo Realizando backup do banco de dados...
pg_dump "%SUPABASE_DB_URL%" > "%BACKUP_DIR%\db_backup_%TIMESTAMP%.sql"

if %ERRORLEVEL% EQU 0 (
    echo [%DATE% %TIME%] Backup do banco realizado com sucesso >> %LOG_FILE%
) else (
    echo [%DATE% %TIME%] ERRO: Falha no backup do banco >> %LOG_FILE%
    exit /b 1
)

:: Compactar backup
echo Compactando backup...
powershell Compress-Archive -Path "%BACKUP_DIR%\db_backup_%TIMESTAMP%.sql" -DestinationPath "%BACKUP_DIR%\backup_%TIMESTAMP%.zip"

if %ERRORLEVEL% EQU 0 (
    echo [%DATE% %TIME%] Backup compactado com sucesso >> %LOG_FILE%
) else (
    echo [%DATE% %TIME%] ERRO: Falha na compactação do backup >> %LOG_FILE%
    exit /b 1
)

:: Limpar backups antigos (manter últimos 7 dias)
echo Limpando backups antigos...
forfiles /p "%BACKUP_DIR%" /s /m *.* /d -7 /c "cmd /c del @path" 2>nul

echo [%DATE% %TIME%] Limpeza de backups antigos concluída >> %LOG_FILE%

:: Upload para armazenamento seguro (exemplo com rclone)
if defined RCLONE_REMOTE (
    echo Enviando backup para armazenamento remoto...
    rclone copy "%BACKUP_DIR%\backup_%TIMESTAMP%.zip" "%RCLONE_REMOTE%:/backups/"
    
    if %ERRORLEVEL% EQU 0 (
        echo [%DATE% %TIME%] Backup enviado para armazenamento remoto >> %LOG_FILE%
    ) else (
        echo [%DATE% %TIME%] ERRO: Falha no envio do backup >> %LOG_FILE%
    )
)

echo Backup concluído com sucesso!
echo [%DATE% %TIME%] Processo de backup finalizado >> %LOG_FILE%

endlocal
