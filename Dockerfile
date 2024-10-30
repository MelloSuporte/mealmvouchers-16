# Estágio de build
FROM node:18-alpine as builder

WORKDIR /app

# Instalar dependências primeiro para aproveitar o cache do Docker
COPY package*.json ./
COPY bun.lockb ./

# Instalar todas as dependências, incluindo as de desenvolvimento
RUN npm install

# Copiar o resto dos arquivos do projeto
COPY . .

# Executar o build
RUN npm run build

# Estágio de produção
FROM node:18-alpine

WORKDIR /app

# Instalar apenas as dependências de produção
COPY package*.json ./
COPY bun.lockb ./
RUN npm install --only=production

# Copiar arquivos do build e configurações
COPY --from=builder /app/dist ./dist
COPY .env.example .env
COPY init.sql ./init.sql

# Configurar variáveis de ambiente para produção
ENV NODE_ENV=production

# Expor a porta da aplicação
EXPOSE 5000

# Comando para iniciar a aplicação
CMD ["node", "dist/server.js"]