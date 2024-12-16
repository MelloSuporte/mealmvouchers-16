# Row Level Security (RLS) Policies

## Overview
Este documento serve como índice para todas as políticas de Row Level Security (RLS) implementadas no sistema.

## Documentação Detalhada

1. [Políticas de Usuários](./rls/users_policies.md)
2. [Políticas de Vouchers](./rls/vouchers_policies.md)
3. [Políticas de Empresas](./rls/company_policies.md)
4. [Políticas de Sistema](./rls/system_policies.md)
5. [Políticas de Tipos de Refeição](./rls/meal_types_policies.md)

## Notas Importantes

1. **Hierarquia de Permissões**:
   - Administradores têm acesso total ao sistema
   - Gerentes têm acesso limitado a funcionalidades específicas
   - Usuários regulares têm acesso apenas aos seus próprios dados

2. **Segurança**:
   - Todas as tabelas têm RLS habilitado
   - Políticas específicas controlam o acesso baseado em roles e relacionamentos
   - Funções security definer são usadas para operações críticas

3. **Manutenção**:
   - Alterações nas políticas RLS devem ser feitas com cautela
   - Testes de acesso devem ser realizados após modificações
   - Documentação deve ser atualizada quando houver mudanças