-- Drop existing policies
DROP POLICY IF EXISTS "uso_voucher_select_policy" ON uso_voucher;
DROP POLICY IF EXISTS "uso_voucher_insert_policy" ON uso_voucher;
DROP POLICY IF EXISTS "uso_voucher_update_policy" ON uso_voucher;
DROP POLICY IF EXISTS "uso_voucher_delete_policy" ON uso_voucher;

-- Enable RLS
ALTER TABLE uso_voucher ENABLE ROW LEVEL SECURITY;

-- Create SELECT policy - All authenticated and anonymous users can see all reports
CREATE POLICY "uso_voucher_select_policy" ON uso_voucher
    FOR SELECT TO authenticated, anon
    USING (true);

-- Create INSERT policy - Only administrators can insert
CREATE POLICY "uso_voucher_insert_policy" ON uso_voucher
    FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM admin_users au
            WHERE au.id = auth.uid()
            AND au.permissoes->>'admin' = 'true'
            AND NOT au.suspenso
        )
    );

-- Create UPDATE policy - Only administrators can update
CREATE POLICY "uso_voucher_update_policy" ON uso_voucher
    FOR UPDATE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM admin_users au
            WHERE au.id = auth.uid()
            AND au.permissoes->>'admin' = 'true'
            AND NOT au.suspenso
        )
    );

-- Create DELETE policy - Only administrators can delete
CREATE POLICY "uso_voucher_delete_policy" ON uso_voucher
    FOR DELETE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM admin_users au
            WHERE au.id = auth.uid()
            AND au.permissoes->>'admin' = 'true'
            AND NOT au.suspenso
        )
    );

-- Grant permissions
GRANT SELECT ON uso_voucher TO authenticated, anon;
GRANT ALL ON uso_voucher TO service_role;

-- Add comment documenting the policies
COMMENT ON TABLE uso_voucher IS 'Tabela de uso de vouchers com RLS implementada. Políticas: SELECT para todos os usuários, INSERT/UPDATE/DELETE apenas para administradores.';

-- Create view for metrics with RLS
CREATE OR REPLACE VIEW vw_uso_voucher_metricas AS
SELECT 
    COUNT(*) as total_usos,
    COUNT(DISTINCT usuario_id) as total_usuarios,
    DATE_TRUNC('day', usado_em) as data
FROM uso_voucher
GROUP BY DATE_TRUNC('day', usado_em);

-- Grant permissions on metrics view
GRANT SELECT ON vw_uso_voucher_metricas TO authenticated, anon;

-- Add RLS to view
ALTER VIEW vw_uso_voucher_metricas OWNER TO authenticated;