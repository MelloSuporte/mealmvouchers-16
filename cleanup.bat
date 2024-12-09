@echo off
setlocal enabledelayedexpansion

echo Iniciando limpeza e otimização do projeto...

:: Remover arquivos de build antigos
if exist "dist" (
    echo Removendo builds antigos...
    rd /s /q "dist"
)

:: Limpar cache do npm
echo Limpando cache do npm...
npm cache clean --force

:: Remover node_modules
if exist "node_modules" (
    echo Removendo node_modules...
    rd /s /q "node_modules"
)

:: Remover arquivos de lock
if exist "package-lock.json" (
    echo Removendo package-lock.json...
    del package-lock.json
)

:: Remover arquivos temporários
echo Removendo arquivos temporários...
del /s /q *.log
del /s /q *.tmp
del /s /q .env.local
del /s /q .env.development.local
del /s /q .env.test.local
del /s /q .env.production.local

:: Limpar cache do Docker
echo Limpando cache do Docker...
docker system prune -f

:: Reinstalar dependências
echo Reinstalando dependências...
npm install

:: Reconstruir o projeto
echo Reconstruindo o projeto...
npm run build

echo Limpeza concluída!
echo.
echo Próximos passos recomendados:
echo 1. Verifique se o arquivo .env está configurado corretamente
echo 2. Teste a aplicação localmente: npm run dev
echo 3. Verifique se todas as funcionalidades estão operando normalmente

endlocal
