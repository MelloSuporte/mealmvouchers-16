@echo off
echo Importando schema para o Supabase Studio...

REM Configurar variáveis do PostgreSQL diretamente
set PGHOST=postgresql
set PGPORT=6543
set PGUSER=postgres.bh
set PGPASSWORD=Voucher#2024@
set PGDATABASE=postgresql

REM Verificar se o PostgreSQL está instalado
where psql > nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ERRO: PostgreSQL não encontrado!
    echo.
    echo Por favor, instale o PostgreSQL e adicione-o ao PATH do sistema:
    echo 1. Baixe o PostgreSQL em: https://www.postgresql.org/download/windows/
    echo 2. Durante a instalação, marque a opção para adicionar ao PATH
    echo 3. Reinicie o computador após a instalação
    echo.
    pause
    exit /b 1
)

REM Verificar se o arquivo SQL existe
if not exist "supabase/migrations/20231209000000_initial_schema.sql" (
    echo ERRO: Arquivo SQL não encontrado!
    echo Verifique se o arquivo exists em: supabase/migrations/20231209000000_initial_schema.sql
    pause
    exit /b 1
)

REM Verificar se o Supabase Studio está rodando
docker ps | findstr "supabase-studio" > nul
if %ERRORLEVEL% NEQ 0 (
    echo ERRO: Supabase Studio não está rodando!
    echo Execute: docker start supabase-studio
    pause
    exit /b 1
)

echo.
echo Configurações:
echo Host: %PGHOST%
echo Port: %PGPORT%
echo Database: %PGDATABASE%
echo User: %PGUSER%
echo.

REM Executar o script SQL
echo Importando schema...
psql -h %PGHOST% -p %PGPORT% -U %PGUSER% -d %PGDATABASE% -f supabase/migrations/20231209000000_initial_schema.sql

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