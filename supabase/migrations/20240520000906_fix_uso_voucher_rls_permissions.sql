-- Drop existing policies
DROP POLICY IF EXISTS "uso_voucher_insert_policy" ON uso_voucher;
DROP POLICY IF EXISTS "uso_voucher_select_policy" ON uso_voucher;

-- Enable RLS
ALTER TABLE uso_voucher ENABLE ROW LEVEL SECURITY;

-- Create unified insert policy with proper validation for all voucher types
CREATE POLICY "uso_voucher_insert_policy" ON uso_voucher AS PERMISSIVE
    FOR INSERT TO authenticated, anon
    WITH CHECK (
        -- Allow system to register voucher usage
        (
            EXISTS (
                SELECT 1 FROM admin_users au
                WHERE au.id = auth.uid()
                AND au.permissoes->>'sistema' = 'true'
            )
        )
        OR
        -- Allow voucher comum usage
        (
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
        )
        OR
        -- Allow voucher extra usage
        (
            tipo_voucher = 'extra'
            AND voucher_extra_id IS NOT NULL
            AND EXISTS (
                SELECT 1 FROM vouchers_extras ve
                WHERE ve.id = voucher_extra_id
                AND ve.usado_em IS NULL
                AND ve.usuario_id = usuario_id
            )
        )
        OR
        -- Allow voucher descartável usage
        (
            tipo_voucher = 'descartavel'
            AND voucher_descartavel_id IS NOT NULL
            AND EXISTS (
                SELECT 1 FROM vouchers_descartaveis vd
                WHERE vd.id = voucher_descartavel_id
                AND vd.usado_em IS NULL
                AND CURRENT_DATE <= vd.data_expiracao::date
            )
        )
    );

-- Create select policy
CREATE POLICY "uso_voucher_select_policy" ON uso_voucher AS PERMISSIVE
    FOR SELECT TO authenticated, anon
    USING (
        -- Authenticated users can see their own records
        (auth.uid() IS NOT NULL AND usuario_id = auth.uid())
        OR
        -- Admins can see all records
        (
            EXISTS (
                SELECT 1 FROM admin_users au
                WHERE au.id = auth.uid()
                AND au.permissoes->>'gerenciar_usuarios' = 'true'
                AND NOT au.suspenso
            )
        )
        OR
        -- Anonymous users can see disposable voucher usage
        (
            auth.uid() IS NULL 
            AND tipo_voucher = 'descartavel'
            AND voucher_descartavel_id IS NOT NULL
        )
    );

-- Grant necessary permissions
GRANT SELECT, INSERT ON uso_voucher TO authenticated;
GRANT SELECT, INSERT ON uso_voucher TO anon;

-- Add helpful comments
COMMENT ON POLICY "uso_voucher_insert_policy" ON uso_voucher IS 
'Permite registro de uso de vouchers (comum, extra e descartável) com validações específicas para cada tipo';

COMMENT ON POLICY "uso_voucher_select_policy" ON uso_voucher IS 
'Permite visualização do histórico de uso de vouchers com base no tipo de usuário';