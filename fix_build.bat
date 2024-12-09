@echo off
setlocal enabledelayedexpansion

echo Aplicando correções...
copy /y "index.fixed.html" "index.html"
copy /y "vite.config.fixed.js" "vite.config.js"

echo Removendo node_modules e cache...
rd /s /q node_modules
rd /s /q dist
del /f /q package-lock.json
del /f /q bun.lockb

echo Instalando dependências com Bun...
bun install

echo Construindo aplicação...
bun run build

echo Atualizando container...
docker-compose down
docker-compose build --no-cache
docker-compose up -d

echo.
echo Correções aplicadas! Aguarde alguns segundos e acesse http://localhost:3000
echo Para verificar os logs, execute: docker-compose logs -f
echo.

endlocal
