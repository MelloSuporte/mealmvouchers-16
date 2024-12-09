@echo off
setlocal enabledelayedexpansion

:: Configurações
set LOG_FILE=deploy_log.txt
set TIMESTAMP=%DATE:~6,4%%DATE:~3,2%%DATE:~0,2%_%TIME:~0,2%%TIME:~3,2%%TIME:~6,2%
set TIMESTAMP=!TIMESTAMP: =0!

:: Carregar variáveis de ambiente
for /f "tokens=*" %%a in ('type ..\.env') do (
    set %%a
)

echo [%DATE% %TIME%] Iniciando processo de deploy >> %LOG_FILE%

:: Verificar se o Docker está rodando
docker info > nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ERRO: Docker não está rodando!
    echo [%DATE% %TIME%] ERRO: Docker não está rodando >> %LOG_FILE%
    exit /b 1
)

:: Realizar backup antes do deploy
echo Realizando backup de segurança...
call backup_supabase.bat
if %ERRORLEVEL% NEQ 0 (
    echo ERRO: Falha no backup de segurança!
    echo [%DATE% %TIME%] ERRO: Falha no backup de segurança >> %LOG_FILE%
    exit /b 1
)

:: Parar containers existentes
echo Parando containers existentes...
docker-compose -f ../docker-compose.yml down
if %ERRORLEVEL% NEQ 0 (
    echo [%DATE% %TIME%] AVISO: Erro ao parar containers >> %LOG_FILE%
)

:: Remover imagens antigas
echo Removendo imagens antigas...
docker image prune -f
if %ERRORLEVEL% NEQ 0 (
    echo [%DATE% %TIME%] AVISO: Erro ao remover imagens antigas >> %LOG_FILE%
)

:: Build das novas imagens
echo Construindo novas imagens...
docker-compose -f ../docker-compose.yml build --no-cache
if %ERRORLEVEL% NEQ 0 (
    echo ERRO: Falha no build das imagens!
    echo [%DATE% %TIME%] ERRO: Falha no build das imagens >> %LOG_FILE%
    exit /b 1
)

:: Iniciar novos containers
echo Iniciando novos containers...
docker-compose -f ../docker-compose.yml up -d
if %ERRORLEVEL% NEQ 0 (
    echo ERRO: Falha ao iniciar containers!
    echo [%DATE% %TIME%] ERRO: Falha ao iniciar containers >> %LOG_FILE%
    exit /b 1
)

:: Verificar saúde dos containers
echo Verificando saúde dos containers...
timeout /t 30 /nobreak > nul
docker-compose -f ../docker-compose.yml ps | findstr "Exit" > nul
if %ERRORLEVEL% EQU 0 (
    echo ERRO: Alguns containers falharam ao iniciar!
    echo [%DATE% %TIME%] ERRO: Containers falharam ao iniciar >> %LOG_FILE%
    
    :: Rollback automático
    echo Iniciando rollback...
    echo [%DATE% %TIME%] Iniciando processo de rollback >> %LOG_FILE%
    
    docker-compose -f ../docker-compose.yml down
    docker-compose -f ../docker-compose.yml up -d --no-build
    
    if %ERRORLEVEL% NEQ 0 (
        echo ERRO CRÍTICO: Falha no rollback!
        echo [%DATE% %TIME%] ERRO CRÍTICO: Falha no rollback >> %LOG_FILE%
        exit /b 1
    )
    
    echo Rollback concluído com sucesso
    echo [%DATE% %TIME%] Rollback concluído com sucesso >> %LOG_FILE%
    exit /b 1
)

:: Verificar logs dos containers
echo Verificando logs dos containers...
docker-compose -f ../docker-compose.yml logs --tail=100 > "%TIMESTAMP%_deploy_containers.log"

echo Deploy concluído com sucesso!
echo [%DATE% %TIME%] Deploy concluído com sucesso >> %LOG_FILE%

endlocal
