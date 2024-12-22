-- Enable RLS on relatorio_uso_voucher
ALTER TABLE relatorio_uso_voucher ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Usuários podem ver registros de sua empresa" ON relatorio_uso_voucher;
DROP POLICY IF EXISTS "relatorio_uso_voucher_select_policy" ON relatorio_uso_voucher;
DROP POLICY IF EXISTS "relatorio_uso_voucher_insert_policy" ON relatorio_uso_voucher;

-- Create select policy
CREATE POLICY "relatorio_uso_voucher_select_policy" ON relatorio_uso_voucher
    FOR SELECT TO authenticated
    USING (
        empresa_id IN (
            SELECT empresa_id 
            FROM usuarios 
            WHERE id = auth.uid()
        )
        OR 
        EXISTS (
            SELECT 1 FROM usuarios
            WHERE id = auth.uid()
            AND role IN ('admin', 'manager')
        )
    );

-- Create insert policy
CREATE POLICY "relatorio_uso_voucher_insert_policy" ON relatorio_uso_voucher
    FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM usuarios
            WHERE id = auth.uid()
            AND role IN ('admin', 'manager')
        )
    );

-- Grant necessary permissions
GRANT SELECT ON relatorio_uso_voucher TO authenticated;
GRANT INSERT ON relatorio_uso_voucher TO authenticated;

-- Add helpful comments
COMMENT ON TABLE relatorio_uso_voucher IS 'Tabela de relatório de uso de vouchers com RLS habilitado';
COMMENT ON POLICY "relatorio_uso_voucher_select_policy" ON relatorio_uso_voucher IS 
'Permite que usuários vejam relatórios de sua empresa e admins/gerentes vejam todos';
COMMENT ON POLICY "relatorio_uso_voucher_insert_policy" ON relatorio_uso_voucher IS 
'Permite que apenas admins e gerentes insiram novos registros';