# Build stage
FROM oven/bun:1-debian as builder

WORKDIR /app

# Copiar arquivos de configuração primeiro
COPY package.json bun.lockb ./

# Instalar dependências
RUN bun install

# Copiar código fonte
COPY . .

# Construir a aplicação
RUN bun run build

# Production stage
FROM nginx:alpine

# Copiar configuração do nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar arquivos construídos do estágio anterior
COPY --from=builder /app/dist /usr/share/nginx/html

# Criar diretório para logs e ajustar permissões
RUN mkdir -p /var/log/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    chmod -R 755 /usr/share/nginx/html

# Expor porta
EXPOSE 80

# Comando para iniciar o nginx
CMD ["nginx", "-g", "daemon off;"]