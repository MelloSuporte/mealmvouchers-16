@echo off
setlocal enabledelayedexpansion

:: Configurações
set BACKUP_DIR=backups
set LOG_FILE=restore_log.txt
set TIMESTAMP=%DATE:~6,4%%DATE:~3,2%%DATE:~0,2%_%TIME:~0,2%%TIME:~3,2%%TIME:~6,2%
set TIMESTAMP=!TIMESTAMP: =0!

:: Carregar variáveis de ambiente
for /f "tokens=*" %%a in ('type ..\.env') do (
    set %%a
)

echo [%DATE% %TIME%] Iniciando processo de restauração >> %LOG_FILE%

:: Listar backups disponíveis
echo Backups disponíveis:
dir /b "%BACKUP_DIR%\*.zip"

:: Solicitar qual backup restaurar
set /p BACKUP_FILE="Digite o nome do arquivo de backup para restaurar: "

if not exist "%BACKUP_DIR%\%BACKUP_FILE%" (
    echo ERRO: Arquivo de backup não encontrado!
    echo [%DATE% %TIME%] ERRO: Arquivo de backup não encontrado - %BACKUP_FILE% >> %LOG_FILE%
    exit /b 1
)

:: Extrair backup
echo Extraindo backup...
powershell Expand-Archive -Path "%BACKUP_DIR%\%BACKUP_FILE%" -DestinationPath "%BACKUP_DIR%\temp_%TIMESTAMP%" -Force

if %ERRORLEVEL% NEQ 0 (
    echo ERRO: Falha ao extrair backup!
    echo [%DATE% %TIME%] ERRO: Falha ao extrair backup >> %LOG_FILE%
    exit /b 1
)

:: Parar containers antes da restauração
echo Parando containers...
docker-compose -f ../docker-compose.yml down
if %ERRORLEVEL% NEQ 0 (
    echo AVISO: Erro ao parar containers
    echo [%DATE% %TIME%] AVISO: Erro ao parar containers >> %LOG_FILE%
)

:: Restaurar banco de dados
echo Restaurando banco de dados...
for %%f in ("%BACKUP_DIR%\temp_%TIMESTAMP%\*.sql") do (
    psql "%SUPABASE_DB_URL%" < "%%f"
    if !ERRORLEVEL! NEQ 0 (
        echo ERRO: Falha ao restaurar banco de dados!
        echo [%DATE% %TIME%] ERRO: Falha ao restaurar banco de dados >> %LOG_FILE%
        goto cleanup
    )
)

:: Reiniciar containers
echo Reiniciando containers...
docker-compose -f ../docker-compose.yml up -d
if %ERRORLEVEL% NEQ 0 (
    echo ERRO: Falha ao reiniciar containers!
    echo [%DATE% %TIME%] ERRO: Falha ao reiniciar containers >> %LOG_FILE%
    goto cleanup
)

echo Restauração concluída com sucesso!
echo [%DATE% %TIME%] Restauração concluída com sucesso >> %LOG_FILE%

:cleanup
:: Limpar arquivos temporários
echo Limpando arquivos temporários...
rmdir /s /q "%BACKUP_DIR%\temp_%TIMESTAMP%"

endlocal
