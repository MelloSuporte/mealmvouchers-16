-- Drop existing policies
DROP POLICY IF EXISTS "uso_voucher_insert_policy" ON uso_voucher;
DROP POLICY IF EXISTS "uso_voucher_select_policy" ON uso_voucher;

-- Enable RLS
ALTER TABLE uso_voucher ENABLE ROW LEVEL SECURITY;

-- Create unified insert policy for common vouchers
CREATE POLICY "uso_voucher_insert_policy" ON uso_voucher
    FOR INSERT TO authenticated, anon
    WITH CHECK (
        tipo_voucher = 'comum'
        AND EXISTS (
            SELECT 1 FROM usuarios u
            WHERE u.id = usuario_id
            AND NOT u.suspenso
            AND EXISTS (
                SELECT 1 FROM empresas e
                WHERE e.id = u.empresa_id
                AND e.ativo = true
            )
        )
    );

-- Create select policy
CREATE POLICY "uso_voucher_select_policy" ON uso_voucher
    FOR SELECT TO authenticated, anon
    USING (
        usuario_id = auth.uid()
        OR
        EXISTS (
            SELECT 1 FROM admin_users au
            WHERE au.id = auth.uid()
            AND au.permissoes->>'gerenciar_usuarios' = 'true'
            AND NOT au.suspenso
        )
    );

-- Grant necessary permissions
GRANT SELECT, INSERT ON uso_voucher TO authenticated;
GRANT SELECT, INSERT ON uso_voucher TO anon;

-- Add helpful comments
COMMENT ON POLICY "uso_voucher_insert_policy" ON uso_voucher IS 
'Permite registro de uso apenas para vouchers comuns com validações de usuário e empresa';

COMMENT ON POLICY "uso_voucher_select_policy" ON uso_voucher IS 
'Permite visualização do histórico de uso de vouchers';