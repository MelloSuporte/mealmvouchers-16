-- Enable RLS on vouchers_extras
ALTER TABLE vouchers_extras ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Apenas usuários autenticados podem inserir vouchers extras" ON vouchers_extras;
DROP POLICY IF EXISTS "Enable read for all authenticated users" ON vouchers_extras;
DROP POLICY IF EXISTS "vouchers_extras_insert" ON vouchers_extras;
DROP POLICY IF EXISTS "vouchers_extras_select" ON vouchers_extras;
DROP POLICY IF EXISTS "vouchers_extras_update" ON vouchers_extras;

-- Create select policy
CREATE POLICY "vouchers_extras_select_policy" ON vouchers_extras
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

-- Create insert policy
CREATE POLICY "vouchers_extras_insert_policy" ON vouchers_extras
    FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM usuarios u
            WHERE u.id = auth.uid()
            AND u.role IN ('admin', 'gestor')
            AND NOT u.suspenso
        )
    );

-- Create update policy
CREATE POLICY "vouchers_extras_update_policy" ON vouchers_extras
    FOR UPDATE TO authenticated
    USING (
        usuario_id = auth.uid()
        AND usado_em IS NULL
        AND CURRENT_DATE <= valido_ate
    )
    WITH CHECK (
        id = id
        AND usuario_id = usuario_id
        AND tipo_refeicao_id = tipo_refeicao_id
        AND valido_ate = valido_ate
    );

-- Grant necessary permissions
GRANT ALL ON vouchers_extras TO authenticated;
GRANT SELECT ON vouchers_extras TO anon;

-- Add helpful comments
COMMENT ON TABLE vouchers_extras IS 'Tabela de vouchers extras com RLS habilitado';
COMMENT ON POLICY "vouchers_extras_select_policy" ON vouchers_extras IS 
'Permite que usuários vejam seus próprios vouchers extras e admins/gestores vejam todos';
COMMENT ON POLICY "vouchers_extras_insert_policy" ON vouchers_extras IS
'Permite apenas que admins e gestores criem novos vouchers extras';
COMMENT ON POLICY "vouchers_extras_update_policy" ON vouchers_extras IS
'Permite que usuários usem seus próprios vouchers extras dentro da validade';