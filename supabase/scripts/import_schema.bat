@echo off
setlocal enabledelayedexpansion

REM Carregar variáveis de ambiente do arquivo .env
for /f "tokens=*" %%a in ('type ..\.env ^| findstr /v /c:"#"') do (
    set "%%a"
)

REM Verificar se existe backup
cd ..\supabase\backups
for /f "delims=" %%i in ('dir /b /o-d schema_backup_*.sql') do (
    set "latest_backup=%%i"
    goto :found
)
:found

if not defined latest_backup (
    echo Nenhum arquivo de backup encontrado em supabase\backups
    echo Execute primeiro o backup_schema.bat
    pause
    exit /b 1
)

echo Encontrado backup mais recente: %latest_backup%
echo.

REM Confirmar com o usuário
echo ATENÇÃO: Este script irá:
echo 1. Parar o container do Supabase Studio
echo 2. Remover o schema atual
echo 3. Importar o schema do backup
echo 4. Reiniciar o Supabase Studio
echo.
set /p "confirm=Deseja continuar? (S/N): "
if /i not "%confirm%"=="S" (
    echo Operação cancelada pelo usuário.
    pause
    exit /b 0
)

echo.
echo Parando container do Supabase Studio...
docker stop supabase-studio

echo.
echo Importando schema do backup...
psql ^
    --host=%POSTGRES_HOST% ^
    --port=%POSTGRES_PORT% ^
    --username=%POSTGRES_USER% ^
    --dbname=%POSTGRES_DB% ^
    --file="%latest_backup%"

if %ERRORLEVEL% EQU 0 (
    echo Schema importado com sucesso!
) else (
    echo Erro ao importar schema!
    goto :error
)

echo.
echo Reiniciando Supabase Studio...
docker start supabase-studio

if %ERRORLEVEL% EQU 0 (
    echo.
    echo Importação concluída com sucesso!
    echo O Supabase Studio foi reiniciado.
    echo Aguarde alguns segundos e acesse: http://localhost:3000
) else (
    echo Erro ao reiniciar Supabase Studio!
    goto :error
)

goto :end

:error
echo.
echo Ocorreu um erro durante a importação.
echo Verifique as mensagens acima para mais detalhes.
pause
exit /b 1

:end
echo.
echo Pressione qualquer tecla para sair...
pause > nul
