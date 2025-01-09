# Estágio de build
FROM node:18-alpine as builder

WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./

# Instalar dependências com fallback para --legacy-peer-deps
RUN npm ci || npm ci --legacy-peer-deps

# Copiar código fonte
COPY . .

# Build da aplicação
RUN npm run build

# Estágio de produção
FROM node:18-alpine

WORKDIR /app

# Copiar apenas os arquivos necessários do estágio de build
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules

# Configurar variáveis de ambiente para timeouts
ENV NODE_OPTIONS="--max-http-header-size=16384 --max-old-space-size=4096"
ENV HTTP_TIMEOUT=120000
ENV KEEP_ALIVE_TIMEOUT=65000

# Expor porta
EXPOSE 80

# Healthcheck mais robusto
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:80/health || exit 1

# Comando para iniciar a aplicação
CMD ["npm", "run", "preview"]