-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "vouchers_comuns_select_policy" ON vouchers_comuns;
DROP POLICY IF EXISTS "vouchers_comuns_insert_policy" ON vouchers_comuns;
DROP POLICY IF EXISTS "vouchers_comuns_update_policy" ON vouchers_comuns;

-- Enable RLS
ALTER TABLE vouchers_comuns ENABLE ROW LEVEL SECURITY;

-- Create select policy with correct column name
CREATE POLICY "vouchers_comuns_select_policy" ON vouchers_comuns
    FOR SELECT TO authenticated
    USING (
        usuario_id = auth.uid()
        OR 
        EXISTS (
            SELECT 1 FROM usuarios u
            WHERE u.id = auth.uid()
            AND u.role IN ('admin', 'gestor')
            AND NOT u.suspenso
        )
    );

-- Create insert policy with system validation
CREATE POLICY "vouchers_comuns_insert_policy" ON vouchers_comuns
    FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM usuarios u
            WHERE u.id = auth.uid()
            AND u.role = 'system'
        )
    );

-- Create update policy for usage tracking
CREATE POLICY "vouchers_comuns_update_policy" ON vouchers_comuns
    FOR UPDATE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM usuarios u
            WHERE u.id = auth.uid()
            AND u.role IN ('admin', 'system')
            AND NOT u.suspenso
        )
    )
    WITH CHECK (
        usado_em IS NOT NULL
    );

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE ON vouchers_comuns TO authenticated;

-- Add helpful comments
COMMENT ON POLICY "vouchers_comuns_select_policy" ON vouchers_comuns IS 
'Permite visualizar vouchers comuns próprios ou se for admin/gestor';

COMMENT ON POLICY "vouchers_comuns_insert_policy" ON vouchers_comuns IS 
'Permite apenas o sistema criar novos vouchers comuns';

COMMENT ON POLICY "vouchers_comuns_update_policy" ON vouchers_comuns IS 
'Permite apenas admin e sistema marcar vouchers como usados';