# Políticas RLS para Uso de Vouchers

## Visão Geral

As políticas de RLS (Row Level Security) para uso de vouchers garantem que:

### Leitura (SELECT)
- Todos os usuários (autenticados e anônimos) podem ver todos os registros de uso
- Acesso total a métricas e gráficos

### Inserção (INSERT)
- Apenas administradores podem inserir novos registros

### Atualização (UPDATE)
- Apenas administradores podem atualizar registros

### Exclusão (DELETE)
- Apenas administradores podem excluir registros

## Implementação

```sql
-- Exemplo de política SELECT
CREATE POLICY "uso_voucher_select_policy"
ON uso_voucher FOR SELECT
TO authenticated, anon
USING (true);
```

## Notas Importantes

1. Todas as operações verificam se o usuário não está suspenso
2. Métricas e gráficos são acessíveis a todos os usuários
3. O service_role tem acesso total à tabela
4. Usuários anônimos têm acesso total para visualização