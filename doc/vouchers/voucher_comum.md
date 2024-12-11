# Voucher Comum

## Características
- Gerado automaticamente para cada usuário
- Código numérico de 4 dígitos
- Nunca expira
- Único na base de dados
- Vinculado ao CPF do usuário

## Armazenamento
- Armazenado na coluna `voucher` da tabela `usuarios`
- Vínculo direto com o registro do usuário
- Garantia de unicidade por CPF

## Regras de Uso
1. **Validações de Acesso**
   - Verificação de vínculo com usuário ativo
   - Validação de empresa ativa
   - Verificação de turno do usuário

2. **Limites**
   - 1 refeição por período
   - Máximo 3 refeições por dia
   - Intervalo mínimo entre refeições: 3 horas

3. **Horários**
   - Respeita horários definidos por tipo de refeição
   - Considera tolerância padrão de 15 minutos
   - Validação de turno do usuário

## Segurança
- Apenas sistema pode atualizar o voucher
- Registro de todas as operações
- Auditoria completa de uso