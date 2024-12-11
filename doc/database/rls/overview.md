# Visão Geral das Políticas RLS

## Hierarquia de Permissões

1. **Administradores (admin)**
   - Acesso total ao sistema
   - Podem gerenciar todos os recursos
   - Podem criar/modificar políticas

2. **Gerentes (manager)**
   - Acesso limitado a funcionalidades específicas
   - Podem gerenciar usuários de sua empresa
   - Podem gerar relatórios

3. **Usuários (user)**
   - Acesso apenas aos próprios dados
   - Podem usar vouchers
   - Podem ver histórico próprio

## Conceitos Básicos

- Todas as tabelas têm RLS habilitado
- Políticas específicas controlam acesso baseado em roles
- Funções security definer são usadas para operações críticas

## Segurança

- Validações em nível de aplicação e banco
- Logs de todas as operações críticas
- Backups regulares das políticas