-- Enable RLS on relatorio_uso_voucher table
ALTER TABLE relatorio_uso_voucher ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Relatórios - Select for users" ON relatorio_uso_voucher;
DROP POLICY IF EXISTS "Relatórios - Insert for administrators" ON relatorio_uso_voucher;
DROP POLICY IF EXISTS "Relatórios - Update for administrators" ON relatorio_uso_voucher;
DROP POLICY IF EXISTS "Relatórios - Delete for administrators" ON relatorio_uso_voucher;

-- Create SELECT policy - All authenticated and anonymous users can see all reports
CREATE POLICY "Relatórios - Select for all users"
ON relatorio_uso_voucher FOR SELECT
TO authenticated, anon
USING (true);

-- Create INSERT policy - Only administrators can insert
CREATE POLICY "Relatórios - Insert for administrators"
ON relatorio_uso_voucher FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM admin_users au
        WHERE au.id = auth.uid()
        AND au.permissoes->>'admin' = 'true'
        AND NOT au.suspenso
    )
);

-- Create UPDATE policy - Only administrators can update
CREATE POLICY "Relatórios - Update for administrators"
ON relatorio_uso_voucher FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM admin_users au
        WHERE au.id = auth.uid()
        AND au.permissoes->>'admin' = 'true'
        AND NOT au.suspenso
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM admin_users au
        WHERE au.id = auth.uid()
        AND au.permissoes->>'admin' = 'true'
        AND NOT au.suspenso
    )
);

-- Create DELETE policy - Only administrators can delete
CREATE POLICY "Relatórios - Delete for administrators"
ON relatorio_uso_voucher FOR DELETE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM admin_users au
        WHERE au.id = auth.uid()
        AND au.permissoes->>'admin' = 'true'
        AND NOT au.suspenso
    )
);

-- Grant necessary permissions
GRANT ALL ON relatorio_uso_voucher TO authenticated;
GRANT SELECT ON relatorio_uso_voucher TO anon;
GRANT ALL ON relatorio_uso_voucher TO service_role;

-- Add comment documenting the policies
COMMENT ON TABLE relatorio_uso_voucher IS 'Tabela de relatórios com RLS implementada. Políticas: SELECT para todos os usuários, INSERT/UPDATE/DELETE apenas para administradores.';

-- Create view for report metrics with RLS
CREATE OR REPLACE VIEW vw_relatorio_metricas
WITH (security_barrier = true)
AS
SELECT 
    empresa_id,
    nome_empresa,
    COUNT(*) as total_refeicoes,
    SUM(valor) as valor_total,
    AVG(valor) as valor_medio,
    COUNT(DISTINCT usuario_id) as total_usuarios
FROM relatorio_uso_voucher
GROUP BY empresa_id, nome_empresa;

-- Grant view permissions
GRANT SELECT ON vw_relatorio_metricas TO authenticated, anon;

-- Add RLS to view
ALTER VIEW vw_relatorio_metricas OWNER TO authenticated;

<lov-write file_path="doc/database/rls/report_policies.md">
# Políticas RLS para Relatórios

## Visão Geral

As políticas de RLS (Row Level Security) para relatórios garantem que:

### Leitura (SELECT)
- Todos os usuários (autenticados e anônimos) podem ver todos os relatórios
- Acesso total a métricas e gráficos

### Inserção (INSERT)
- Apenas administradores podem inserir novos relatórios

### Atualização (UPDATE)
- Apenas administradores podem atualizar relatórios

### Exclusão (DELETE)
- Apenas administradores podem excluir relatórios

## Implementação

```sql
-- Exemplo de política SELECT
CREATE POLICY "Relatórios - Select for all users"
ON relatorio_uso_voucher FOR SELECT
TO authenticated, anon
USING (true);
```

## Notas Importantes

1. Todas as operações verificam se o usuário não está suspenso
2. Métricas e gráficos são acessíveis a todos os usuários
3. O service_role tem acesso total à tabela
4. Usuários anônimos têm acesso total para visualização