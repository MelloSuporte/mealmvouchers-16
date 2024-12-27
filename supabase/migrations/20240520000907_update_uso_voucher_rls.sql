-- Drop existing policies
DROP POLICY IF EXISTS "uso_voucher_insert_policy" ON uso_voucher;
DROP POLICY IF EXISTS "uso_voucher_select_policy" ON uso_voucher;

-- Enable RLS
ALTER TABLE uso_voucher ENABLE ROW LEVEL SECURITY;

-- Create unified insert policy for all voucher types
CREATE POLICY "uso_voucher_insert_policy" ON uso_voucher AS PERMISSIVE
    FOR INSERT TO authenticated, anon
    WITH CHECK (
        -- Validação para voucher comum
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
        -- Validação para voucher extra
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
        -- Validação para voucher descartável
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

-- Create select policy with appropriate visibility rules
CREATE POLICY "uso_voucher_select_policy" ON uso_voucher AS PERMISSIVE
    FOR SELECT TO authenticated, anon
    USING (
        -- Usuários autenticados podem ver seus próprios registros
        (
            auth.uid() IS NOT NULL 
            AND usuario_id = auth.uid()
        )
        OR
        -- Admins podem ver todos os registros
        (
            EXISTS (
                SELECT 1 FROM admin_users au
                WHERE au.id = auth.uid()
                AND au.permissoes->>'gerenciar_usuarios' = 'true'
                AND NOT au.suspenso
            )
        )
        OR
        -- Usuários anônimos podem ver uso de voucher descartável
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
'Permite registro de uso de vouchers (comum, extra e descartável) por usuários autenticados e anônimos';

COMMENT ON POLICY "uso_voucher_select_policy" ON uso_voucher IS 
'Permite visualização do histórico de uso de vouchers com base no tipo de usuário';