@echo off
setlocal enabledelayedexpansion

echo Iniciando otimização do projeto...

:: Atualizar .env.example e remover .env do controle de versão
echo Atualizando .env.example...
copy .env .env.backup
type .env | findstr /v "KEY PASSWORD TOKEN SECRET" > .env.example

:: Otimizar imagens Docker
echo Otimizando imagens Docker...
docker image prune -f

:: Remover scripts duplicados
if exist "backup.sh" (
    echo Removendo script duplicado backup.sh...
    del backup.sh
)
if exist "deploy.sh" (
    echo Removendo script duplicado deploy.sh...
    del deploy.sh
)
if exist "install-backup-cron.sh" (
    echo Removendo script duplicado install-backup-cron.sh...
    del install-backup-cron.sh
)

:: Mover scripts de backup e deploy para pasta deployment_issues
echo Organizando scripts...
if exist "backup.bat" (
    move backup.bat deployment_issues\
)
if exist "deploy.bat" (
    move deploy.bat deployment_issues\
)
if exist "install-backup-cron.bat" (
    move install-backup-cron.bat deployment_issues\
)

:: Otimizar configurações do Nginx
echo Otimizando configurações do Nginx...
echo worker_processes auto; > nginx.conf.tmp
echo events { worker_connections 1024; } >> nginx.conf.tmp
echo http { >> nginx.conf.tmp
echo     gzip on; >> nginx.conf.tmp
echo     gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript; >> nginx.conf.tmp
echo     client_max_body_size 100M; >> nginx.conf.tmp
echo     server_tokens off; >> nginx.conf.tmp
echo     include /etc/nginx/mime.types; >> nginx.conf.tmp
echo     server { >> nginx.conf.tmp
echo         listen 80; >> nginx.conf.tmp
echo         root /usr/share/nginx/html; >> nginx.conf.tmp
echo         index index.html; >> nginx.conf.tmp
echo         location / { >> nginx.conf.tmp
echo             try_files $uri $uri/ /index.html; >> nginx.conf.tmp
echo             add_header Cache-Control "no-cache, must-revalidate"; >> nginx.conf.tmp
echo         } >> nginx.conf.tmp
echo         location /assets/ { >> nginx.conf.tmp
echo             expires 1y; >> nginx.conf.tmp
echo             add_header Cache-Control "public, no-transform"; >> nginx.conf.tmp
echo         } >> nginx.conf.tmp
echo     } >> nginx.conf.tmp
echo } >> nginx.conf.tmp
move /y nginx.conf.tmp nginx.conf

:: Otimizar configurações do Vite
echo Otimizando configurações do Vite...
echo import { defineConfig } from 'vite' > vite.config.js.tmp
echo import react from '@vitejs/plugin-react' >> vite.config.js.tmp
echo export default defineConfig({ >> vite.config.js.tmp
echo   plugins: [react()], >> vite.config.js.tmp
echo   build: { >> vite.config.js.tmp
echo     chunkSizeWarningLimit: 1000, >> vite.config.js.tmp
echo     rollupOptions: { >> vite.config.js.tmp
echo       output: { >> vite.config.js.tmp
echo         manualChunks: { >> vite.config.js.tmp
echo           vendor: ['react', 'react-dom'], >> vite.config.js.tmp
echo           ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'] >> vite.config.js.tmp
echo         } >> vite.config.js.tmp
echo       } >> vite.config.js.tmp
echo     } >> vite.config.js.tmp
echo   } >> vite.config.js.tmp
echo }) >> vite.config.js.tmp
move /y vite.config.js.tmp vite.config.js

:: Otimizar Docker Compose
echo Otimizando Docker Compose...
echo version: '3.8' > docker-compose.yml.tmp
echo services: >> docker-compose.yml.tmp
echo   app: >> docker-compose.yml.tmp
echo     build: . >> docker-compose.yml.tmp
echo     ports: >> docker-compose.yml.tmp
echo       - "3000:3000" >> docker-compose.yml.tmp
echo     environment: >> docker-compose.yml.tmp
echo       - NODE_ENV=production >> docker-compose.yml.tmp
echo     restart: unless-stopped >> docker-compose.yml.tmp
echo     healthcheck: >> docker-compose.yml.tmp
echo       test: ["CMD", "curl", "-f", "http://localhost:3000"] >> docker-compose.yml.tmp
echo       interval: 30s >> docker-compose.yml.tmp
echo       timeout: 10s >> docker-compose.yml.tmp
echo       retries: 3 >> docker-compose.yml.tmp
echo   nginx: >> docker-compose.yml.tmp
echo     image: nginx:alpine >> docker-compose.yml.tmp
echo     ports: >> docker-compose.yml.tmp
echo       - "80:80" >> docker-compose.yml.tmp
echo     volumes: >> docker-compose.yml.tmp
echo       - ./nginx.conf:/etc/nginx/nginx.conf:ro >> docker-compose.yml.tmp
echo       - ./dist:/usr/share/nginx/html:ro >> docker-compose.yml.tmp
echo     depends_on: >> docker-compose.yml.tmp
echo       - app >> docker-compose.yml.tmp
echo     restart: unless-stopped >> docker-compose.yml.tmp
move /y docker-compose.yml.tmp docker-compose.yml

echo Otimização concluída!
echo.
echo Próximos passos:
echo 1. Revise as alterações feitas nos arquivos de configuração
echo 2. Teste o build: npm run build
echo 3. Teste o deploy local: docker-compose up -d
echo 4. Verifique se todas as funcionalidades estão operando normalmente

endlocal
