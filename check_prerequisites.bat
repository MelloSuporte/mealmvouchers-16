@echo off
setlocal enabledelayedexpansion

echo Verificando pré-requisitos do sistema...
echo.

:: Verificar Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [X] Node.js não encontrado! Por favor, instale o Node.js de https://nodejs.org/
) else (
    echo [✓] Node.js instalado
    node --version
)

:: Verificar npm
where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo [X] npm não encontrado! Reinstale o Node.js de https://nodejs.org/
) else (
    echo [✓] npm instalado
    npm --version
)

:: Verificar Docker
where docker >nul 2>nul
if %errorlevel% neq 0 (
    echo [X] Docker não encontrado! Por favor, instale o Docker Desktop de https://www.docker.com/products/docker-desktop
) else (
    echo [✓] Docker instalado
    docker --version
)

:: Verificar Git
where git >nul 2>nul
if %errorlevel% neq 0 (
    echo [X] Git não encontrado! Por favor, instale o Git de https://git-scm.com/
) else (
    echo [✓] Git instalado
    git --version
)

echo.
echo Verificação concluída! Por favor, instale os componentes faltantes antes de continuar.
pause

endlocal
