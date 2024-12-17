# Políticas RLS para Vouchers

Este documento organiza as políticas RLS (Row Level Security) para o sistema de vouchers.

## Estrutura

1. [Políticas Base](./vouchers/base_policies.md)
   - Políticas fundamentais que se aplicam a todos os tipos de vouchers

2. [Vouchers Comuns](./vouchers/common_voucher_policies.md)
   - Políticas específicas para vouchers comuns
   - Regras de acesso e uso

3. [Vouchers Extras](./vouchers/extra_voucher_policies.md)
   - Políticas para vouchers extras
   - Autorizações especiais

4. [Vouchers Descartáveis](./vouchers/disposable_voucher_policies.md)
   - Políticas para vouchers descartáveis
   - Regras de uso único

5. [Uso de Vouchers](./vouchers/usage_policies.md)
   - Políticas de registro de uso
   - Validações e controles

6. [Políticas Administrativas](./vouchers/admin_policies.md)
   - Políticas para operações administrativas
   - Controles de sistema

## Notas de Implementação

1. Todas as tabelas têm RLS habilitado
2. Políticas seguem princípio de menor privilégio
3. Validações específicas implementadas via triggers
4. Logs de auditoria mantidos para todas operações
```