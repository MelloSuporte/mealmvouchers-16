# Sistema de Vouchers para Refeitório

## Visão Geral
Sistema desenvolvido para gerenciamento de vouchers de refeição, permitindo controle de acesso ao refeitório através de diferentes tipos de vouchers: comuns, extras e descartáveis.

## Tecnologias Utilizadas
- React + Vite
- Tailwind CSS
- Shadcn/ui
- Supabase (Banco de dados e autenticação)
- React Query
- React Router DOM

## Regras de Negócio

### 1. Tipos de Voucher

#### 1.1 Voucher Comum
- Gerado automaticamente para cada usuário
- Composto por 4 dígitos numéricos
- Nunca expira
- Único na base de dados
- Vinculado ao CPF do usuário
- Geração baseada em:
  - Dígitos do CPF (posições 2-11)
  - Soma dos dígitos
  - Timestamp para aleatoriedade
  - Verificação de unicidade

#### 1.2 Voucher Extra
- Gerado para situações específicas
- Válido por tempo determinado
- Requer autorização
- Vinculado ao usuário específico
- Pode ter observações

#### 1.3 Voucher Descartável
- Uso único
- Não vinculado a usuário específico
- Válido para data específica
- Pode ser gerado em lote

### 2. Fluxos de Utilização

#### 2.1 Voucher Comum e Extra
1. Entrada do código (Voucher.jsx)
2. Seleção de refeição (SelfServices.jsx)
3. Confirmação de dados (UserConfirmation.jsx)
4. Tela de finalização (BomApetite.jsx)
5. Retorno à tela inicial

#### 2.2 Voucher Descartável
1. Entrada do código (Voucher.jsx)
2. Seleção de refeição (SelfServices.jsx)
3. Tela de finalização (BomApetite.jsx)

### 3. Turnos e Horários
- Central: 08:00 às 17:00
- Primeiro: 06:00 às 14:00
- Segundo: 14:00 às 22:00
- Terceiro: 22:00 às 06:00

### 4. Refeições
- Tipos configuráveis
- Horários específicos
- Valores individuais
- Tolerância configurável
- Limite de usuários por dia (opcional)

## Interface do Usuário

### 1. Princípios de UI/UX
- Design responsivo para todos os dispositivos
- Feedback visual através de toasts
- Cores consistentes do sistema
- Ícones intuitivos
- Formulários validados
- Mensagens de erro claras

### 2. Componentes Principais
- Teclado numérico para entrada de voucher
- Seleção de refeições com cards
- Confirmação com dados do usuário
- Tela de sucesso personalizada

### 3. Área Administrativa
- Gestão de empresas
- Cadastro de usuários
- Configuração de turnos
- Geração de vouchers
- Relatórios e logs
- Configurações do sistema

## Banco de Dados

### 1. Tabelas Principais
- empresas
- usuarios
- turnos
- tipos_refeicao
- uso_voucher
- vouchers_extras
- vouchers_descartaveis

### 2. Relacionamentos
- Usuários vinculados a empresas
- Vouchers vinculados a usuários
- Uso vinculado a tipos de refeição

## Configuração do Ambiente

### Desenvolvimento
```bash
# Instalação de dependências
npm install

# Iniciar ambiente de desenvolvimento
npm run dev
```

### Produção
```bash
# Build do projeto
npm run build

# Iniciar em produção
npm start
```

## Boas Práticas

### 1. Código
- Componentes pequenos e focados
- Hooks personalizados para lógica
- Context API para estado global
- Validações consistentes
- Tratamento de erros

### 2. Performance
- Queries otimizadas
- Caching apropriado
- Lazy loading de componentes
- Otimização de imagens

### 3. Segurança
- Validação de inputs
- Proteção contra XSS
- Rate limiting
- Autenticação robusta

## Manutenção

### 1. Backups
- Backup diário do banco
- Versionamento do código
- Logs de sistema

### 2. Monitoramento
- Logs de uso
- Métricas de performance
- Alertas de erro

## Suporte

Para suporte técnico ou dúvidas sobre o sistema, entre em contato através dos canais:
- Email: suporte@sistema.com
- Telefone: (XX) XXXX-XXXX

## Licença
Este projeto está sob a licença [Nome da Licença].