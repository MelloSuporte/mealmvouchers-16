# Estágio de build
FROM oven/bun:1 as builder

WORKDIR /app

# Copiar arquivos de dependências
COPY package.json .
COPY bun.lockb .

# Instalar todas as dependências
RUN bun install

# Copiar o resto dos arquivos do projeto
COPY . .

# Executar o build
RUN bun run build

# Estágio de produção
FROM oven/bun:1-slim

WORKDIR /app

# Copiar arquivos de dependências
COPY package.json .
COPY bun.lockb .

# Instalar apenas as dependências de produção
RUN bun install --production

# Copiar arquivos do build e configurações
COPY --from=builder /app/dist ./dist
COPY .env.example .env
COPY init.sql ./init.sql

# Configurar variáveis de ambiente para produção
ENV NODE_ENV=production

# Expor a porta da aplicação
EXPOSE 5000

# Comando para iniciar a aplicação
CMD ["bun", "dist/server.js"]