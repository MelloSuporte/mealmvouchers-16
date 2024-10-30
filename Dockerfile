# Estágio de build
FROM node:18-alpine as builder

WORKDIR /app

# Copiar arquivos de dependências primeiro
COPY package*.json ./
COPY bun.lockb ./

# Instalar dependências
RUN npm install

# Copiar resto dos arquivos do projeto
COPY . .

# Build da aplicação
RUN npm run build

# Estágio de produção
FROM node:18-alpine

WORKDIR /app

# Copiar arquivos necessários do estágio de build
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules

# Copiar arquivos de configuração
COPY .env.example .env
COPY init.sql ./init.sql

EXPOSE 5000

CMD ["node", "dist/server.js"]