# Regras de Negócio - Sistema de Vouchers para Refeitório

## 1. Vouchers

### 1.1 Voucher Comum
- **Geração**
  - Gerado automaticamente para cada usuário
  - Código numérico de 4 dígitos
  - Nunca expira
  - Único na base de dados
  - Vinculado ao CPF do usuário

- **Algoritmo de Geração**
  - Utiliza dígitos do CPF (posições 2-11)
  - Soma dos dígitos do CPF
  - Timestamp para garantir aleatoriedade
  - Verificação de unicidade na base

- **Validações**
  - Verificação de vínculo com usuário ativo
  - Validação de empresa ativa
  - Verificação de turno do usuário

### 1.2 Voucher Extra
- **Características**
  - Validade temporária (data específica)
  - Requer autorização de gestor
  - Vinculado a usuário específico
  - Permite observações/justificativas

- **Regras de Autorização**
  - Somente gestores podem autorizar
  - Necessário informar motivo
  - Limite máximo de vouchers extras por usuário/mês

- **Validade**
  - Data específica de uso
  - Não permite uso em data diferente
  - Cancelamento automático após data

### 1.3 Voucher Descartável
- **Características**
  - Uso único
  - Não vinculado a usuário específico
  - Válido para data específica
  - Pode ser gerado em lote

- **Regras de Geração em Lote**
  - Limite máximo por lote: 100 vouchers
  - Necessário informar data de validade
  - Prefixo específico para identificação

- **Controle**
  - Invalidação após uso
  - Expiração automática após data
  - Rastreabilidade de geração

## 2. Controle de Acesso

### 2.1 Turnos
- **Central**
  - Horário: 08:00 às 17:00
  - Intervalo padrão: 1 hora
  - Flexibilidade: 30 minutos

- **Primeiro Turno**
  - Horário: 06:00 às 14:00
  - Intervalo padrão: 1 hora
  - Flexibilidade: 15 minutos

- **Segundo Turno**
  - Horário: 14:00 às 22:00
  - Intervalo padrão: 1 hora
  - Flexibilidade: 15 minutos

- **Terceiro Turno**
  - Horário: 22:00 às 06:00
  - Intervalo padrão: 1 hora
  - Flexibilidade: 15 minutos

### 2.2 Refeições
- **Tipos**
  - Café da Manhã
  - Almoço
  - Jantar
  - Ceia

- **Horários**
  - Café da Manhã: 06:00 - 09:00
  - Almoço: 11:00 - 14:00
  - Jantar: 17:00 - 20:00
  - Ceia: 22:00 - 00:00

- **Tolerâncias**
  - Padrão: 15 minutos
  - Excepcional: 30 minutos (com autorização)

### 2.3 Limites
- **Por Usuário**
  - 1 refeição por período
  - Máximo 3 refeições por dia
  - Intervalo mínimo entre refeições: 3 horas

- **Por Tipo de Refeição**
  - Limite diário configurável
  - Controle por empresa
  - Possibilidade de quotas mensais

## 3. Empresas

### 3.1 Cadastro
- **Obrigatório**
  - Nome
  - CNPJ
  - Endereço completo
  - Responsável

- **Opcional**
  - Logo
  - Cores personalizadas
  - Observações

### 3.2 Configurações
- **Limites**
  - Número máximo de usuários
  - Vouchers extras por mês
  - Vouchers descartáveis por mês

- **Personalizações**
  - Horários específicos
  - Tipos de refeição
  - Valores diferenciados

## 4. Usuários

### 4.1 Cadastro
- **Dados Obrigatórios**
  - Nome completo
  - CPF
  - Email
  - Empresa
  - Turno

- **Validações**
  - CPF único no sistema
  - Email único no sistema
  - Vinculação com empresa ativa

### 4.2 Permissões
- **Níveis**
  - Administrador
  - Gestor
  - Usuário comum
  - Operador

- **Capacidades**
  - Administrador: Acesso total
  - Gestor: Gestão de equipe e vouchers
  - Usuário: Uso básico
  - Operador: Validação de vouchers

## 5. Financeiro

### 5.1 Valores
- **Definição**
  - Por tipo de refeição
  - Por empresa
  - Por período

- **Ajustes**
  - Reajuste periódico
  - Descontos por volume
  - Taxas especiais

### 5.2 Faturamento
- **Periodicidade**
  - Mensal
  - Quinzenal (opcional)
  - Semanal (casos especiais)

- **Composição**
  - Valor base das refeições
  - Taxas adicionais
  - Descontos aplicáveis

## 6. Auditoria

### 6.1 Logs
- **Registro**
  - Todas as operações de voucher
  - Alterações de cadastro
  - Acessos ao sistema

- **Retenção**
  - Logs operacionais: 6 meses
  - Logs de auditoria: 5 anos
  - Logs de acesso: 1 ano

### 6.2 Relatórios
- **Periodicidade**
  - Diários (operacional)
  - Semanais (gestão)
  - Mensais (estratégico)

- **Tipos**
  - Uso de vouchers
  - Custos por empresa
  - Análise de padrões
  - Anomalias

## 7. Integrações

### 7.1 RH
- **Sincronização**
  - Cadastro de funcionários
  - Turnos e horários
  - Afastamentos

### 7.2 Financeiro
- **Dados**
  - Custos por centro
  - Faturamento
  - Relatórios contábeis

## 8. Contingência

### 8.1 Falha do Sistema
- **Procedimentos**
  - Validação manual de vouchers
  - Registro posterior
  - Autorização especial

### 8.2 Recuperação
- **Ações**
  - Sincronização de dados
  - Validação de registros
  - Ajustes necessários
