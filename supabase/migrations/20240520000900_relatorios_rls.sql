-- Enable RLS on relatorio_uso_voucher table
ALTER TABLE relatorio_uso_voucher ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Relatórios - Select for users" ON relatorio_uso_voucher;
DROP POLICY IF EXISTS "Relatórios - Insert for administrators" ON relatorio_uso_voucher;
DROP POLICY IF EXISTS "Relatórios - Update for administrators" ON relatorio_uso_voucher;
DROP POLICY IF EXISTS "Relatórios - Delete for administrators" ON relatorio_uso_voucher;

-- Create SELECT policy - Users can see their own reports, admins can see all
CREATE POLICY "Relatórios - Select for users"
ON relatorio_uso_voucher FOR SELECT
TO authenticated, anon
USING (
    (
        -- Usuário comum vê apenas seus próprios relatórios
        auth.uid() = usuario_id
        AND EXISTS (
            SELECT 1 FROM usuarios u
            WHERE u.id = auth.uid()
            AND NOT u.suspenso
        )
    )
    OR
    -- Administradores veem todos os relatórios
    EXISTS (
        SELECT 1 FROM admin_users au
        WHERE au.id = auth.uid()
        AND au.permissoes->>'admin' = 'true'
        AND NOT au.suspenso
    )
);

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
COMMENT ON TABLE relatorio_uso_voucher IS 'Tabela de relatórios com RLS implementada. Políticas: SELECT para usuários (próprios relatórios) e admins (todos), INSERT/UPDATE/DELETE apenas para administradores.';

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