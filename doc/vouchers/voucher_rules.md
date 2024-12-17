# Regras de Vouchers

## 1. Voucher Comum

### Geração
- Gerado automaticamente para cada usuário
- Código numérico de 4 dígitos
- Nunca expira
- Único na base de dados
- Vinculado ao CPF do usuário

### Algoritmo de Geração
- Utiliza dígitos do CPF (posições 2-11)
- Soma dos dígitos do CPF
- Timestamp para garantir aleatoriedade
- Verificação de unicidade na base

### Validações
- Verificação de vínculo com usuário ativo
- Validação de empresa ativa
- Verificação de turno do usuário

## 2. Voucher Extra

### Características
- Validade temporária (data específica)
- Requer autorização de gestor
- Vinculado a usuário específico
- Permite observações/justificativas

### Regras de Autorização
- Somente gestores podem autorizar
- Necessário informar motivo
- Limite máximo de vouchers extras por usuário/mês

### Validade
- Data específica de uso
- Não permite uso em data diferente
- Cancelamento automático após data

## 3. Voucher Descartável

### Características
- Uso único
- Não vinculado a usuário específico
- Válido para data específica
- Pode ser gerado em lote

### Regras de Geração em Lote
- Limite máximo por lote: 100 vouchers
- Necessário informar data de validade
- Prefixo específico para identificação

### Controle
- Invalidação após uso
- Expiração automática após data
- Rastreabilidade de geração