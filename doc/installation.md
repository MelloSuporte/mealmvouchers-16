# Guia de Instalação

## Requisitos do Sistema

### Software Necessário
- Node.js 18+ (recomendado 18.17.0 ou superior)
- Docker e Docker Compose
- Git
- Editor de código (VS Code recomendado)

### Hardware Recomendado
- CPU: 2+ cores
- RAM: 4GB+
- Armazenamento: 20GB+ livre
- Conexão de Internet estável

## Passo a Passo da Instalação

### 1. Preparação do Ambiente

#### 1.1 Clone do Repositório
```bash
git clone [URL_DO_REPOSITÓRIO]
cd mealmvouchers-03
```

#### 1.2 Instalação de Dependências
```bash
npm install
```

### 2. Configuração do Ambiente

#### 2.1 Variáveis de Ambiente
1. Copie o arquivo de exemplo:
```bash
cp .env.example .env
```

2. Configure as seguintes variáveis no arquivo `.env`:
```env
# Supabase
VITE_SUPABASE_URL=sua_url_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anonima

# Configurações do App
VITE_APP_NAME="Sistema de Vouchers"
VITE_API_URL=http://localhost:3000
```

#### 2.2 Banco de Dados
1. Inicie os containers Docker:
```bash
docker-compose up -d
```

2. Execute as migrações:
```bash
npm run db:migrate
```

### 3. Inicialização do Sistema

#### 3.1 Ambiente de Desenvolvimento
```bash
npm run dev
```

#### 3.2 Ambiente de Produção
```bash
npm run build
npm run start
```

## Verificação da Instalação

### 1. Frontend
- Acesse `http://localhost:5173`
- Verifique se a página inicial carrega
- Teste o login e funcionalidades básicas

### 2. Backend
- Verifique a conexão com Supabase
- Teste os endpoints da API
- Confirme o acesso ao banco de dados

### 3. Serviços
- Verifique os containers Docker
- Confirme os logs do sistema
- Teste o backup automático

## Troubleshooting

### Problemas Comuns

#### Erro de Conexão com Supabase
1. Verifique as credenciais no `.env`
2. Confirme o status do serviço Supabase
3. Verifique as regras de firewall

#### Erro no Build
1. Limpe o cache:
```bash
npm clean-install
```
2. Verifique a versão do Node.js
3. Atualize as dependências

#### Erro nos Containers Docker
1. Verifique os logs:
```bash
docker-compose logs
```
2. Reinicie os containers:
```bash
docker-compose down
docker-compose up -d
```

## Próximos Passos

1. Configure os backups automáticos
2. Ajuste as configurações de segurança
3. Configure o monitoramento
4. Prepare o ambiente de produção

## Suporte

Para suporte na instalação:
1. Consulte a documentação completa
2. Verifique as issues no GitHub
3. Entre em contato com a equipe de desenvolvimento
