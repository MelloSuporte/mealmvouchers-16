@echo off
echo Importando schema para o Supabase Studio...

REM Verificar se o Docker está rodando
docker info > nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ERRO: Docker não está rodando!
    echo Por favor, inicie o Docker Desktop e tente novamente.
    pause
    exit /b 1
)

REM Verificar se o Supabase Studio está rodando
docker ps | findstr "supabase-studio" > nul
if %ERRORLEVEL% NEQ 0 (
    echo ERRO: Supabase Studio não está rodando!
    echo Iniciando Supabase Studio...
    docker start supabase-studio
    timeout /t 5
)

REM Verificar se o arquivo SQL existe
if not exist "supabase\migrations\20231209000000_initial_schema.sql" (
    echo ERRO: Arquivo SQL não encontrado!
    echo Verifique se o arquivo existe em: supabase\migrations\20231209000000_initial_schema.sql
    pause
    exit /b 1
)

echo.
echo Importando schema via Docker...
echo.

REM Copiar o arquivo SQL para o container e executar
docker cp supabase\migrations\20231209000000_initial_schema.sql supabase-studio:/tmp/
docker exec supabase-studio psql -h postgresql -p 6543 -U postgres.bh -d postgresql -f /tmp/20231209000000_initial_schema.sql

if %ERRORLEVEL% EQU 0 (
    echo.
    echo Schema importado com sucesso!
    echo Acesse o Supabase Studio em: http://localhost:3000
) else (
    echo.
    echo Erro ao importar schema.
    echo Verifique os logs acima para mais detalhes.
)

echo.
echo Pressione qualquer tecla para sair...
pause > nul