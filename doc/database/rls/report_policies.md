# Políticas RLS para Relatórios

## Visão Geral

As políticas de RLS (Row Level Security) para relatórios garantem que:

### Leitura (SELECT)
- Usuários podem ver apenas seus próprios relatórios
- Administradores podem ver todos os relatórios
- Usuários anônimos e autenticados podem acessar métricas e gráficos

### Inserção (INSERT)
- Apenas administradores podem inserir novos relatórios

### Atualização (UPDATE)
- Apenas administradores podem atualizar relatórios

### Exclusão (DELETE)
- Apenas administradores podem excluir relatórios

## Implementação

```sql
-- Exemplo de política SELECT
CREATE POLICY "Relatórios - Select for users"
ON relatorio_uso_voucher FOR SELECT
TO authenticated, anon
USING (
    auth.uid() = usuario_id OR
    EXISTS (
        SELECT 1 FROM admin_users au
        WHERE au.id = auth.uid()
        AND au.permissoes->>'admin' = 'true'
        AND NOT au.suspenso
    )
);
```

## Notas Importantes

1. Todas as operações verificam se o usuário não está suspenso
2. Métricas e gráficos são acessíveis a todos os usuários
3. O service_role tem acesso total à tabela
4. Usuários anônimos têm acesso somente leitura