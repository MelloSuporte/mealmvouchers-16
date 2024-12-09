@echo off
echo Iniciando Supabase Studio...

REM Parar container se já estiver rodando
docker stop supabase-studio 2>nul
docker rm supabase-studio 2>nul

REM Iniciar Supabase Studio
docker run -d ^
  --name supabase-studio ^
  -p 3001:3000 ^
  -e "SUPABASE_URL=https://bhjbydrcrksvmmpvslbo.supabase.co" ^
  -e "SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJoamJ5ZHJjcmtzdm1tcHZzbGJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzExODM1NzgsImV4cCI6MjA0Njc1OTU3OH0.R9SIFQMw12nRrlJLyd2hWH_cByqVtsbTw1iE2h-cP98" ^
  -e "SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJoamJ5ZHJjcmtzdm1tcHZzbGJvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMTE4MzU3OCwiZXhwIjoyMDQ2NzU5NTc4fQ.Siiu1RsISZBQemcPBRJ9ewANwP7QKq2wUq78A8-dmPs" ^
  -e "STUDIO_PG_META_URL=https://bhjbydrcrksvmmpvslbo.supabase.co/pg" ^
  -e "PG_META_PORT=5432" ^
  -e "PG_META_DB_HOST=postgresql" ^
  -e "PG_META_DB_NAME=postgresql" ^
  -e "PG_META_DB_PORT=6543" ^
  -e "PG_META_DB_USER=postgres.bh" ^
  -e "PG_META_DB_PASSWORD=Voucher#2024@" ^
  supabase/studio:latest

REM Verificar se o container iniciou
docker ps | findstr "supabase-studio" > nul
if %errorlevel% equ 0 (
    echo.
    echo Supabase Studio iniciado com sucesso!
    echo Acesse: http://localhost:3001
    echo.
    echo Para parar o Supabase Studio, execute: docker stop supabase-studio
) else (
    echo.
    echo Erro ao iniciar Supabase Studio.
    echo Verifique os logs com: docker logs supabase-studio
)

REM Aguardar input do usuário
pause
