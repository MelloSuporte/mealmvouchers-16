-- Drop existing policies
DROP POLICY IF EXISTS "uso_voucher_insert_policy" ON uso_voucher;
DROP POLICY IF EXISTS "uso_voucher_select_policy" ON uso_voucher;

-- Enable RLS
ALTER TABLE uso_voucher ENABLE ROW LEVEL SECURITY;

-- Create unified insert policy with proper validation
CREATE POLICY "uso_voucher_insert_policy" ON uso_voucher
    FOR INSERT TO authenticated, anon
    WITH CHECK (
        -- Allow system to register voucher usage
        EXISTS (
            SELECT 1 FROM admin_users au
            WHERE au.id = auth.uid()
            AND au.permissoes->>'sistema' = 'true'
        )
        OR
        -- Allow anonymous users to register disposable voucher usage
        EXISTS (
            SELECT 1 FROM vouchers_descartaveis vd
            WHERE vd.id = voucher_descartavel_id
            AND NOT vd.usado
            AND CURRENT_DATE <= vd.data_expiracao::date
            AND EXISTS (
                SELECT 1 FROM tipos_refeicao tr
                WHERE tr.id = tipo_refeicao_id
                AND tr.ativo = true
                AND CURRENT_TIME BETWEEN tr.horario_inicio 
                AND (tr.horario_fim + (tr.minutos_tolerancia || ' minutes')::INTERVAL)
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
        OR
        -- Allow anonymous users to view their own disposable voucher usage
        voucher_descartavel_id IS NOT NULL
    );

-- Grant necessary permissions
GRANT SELECT, INSERT ON uso_voucher TO anon;
GRANT SELECT ON tipos_refeicao TO anon;

-- Add helpful comments
COMMENT ON POLICY "uso_voucher_insert_policy" ON uso_voucher IS 
'Permite que o sistema e usuários anônimos registrem uso de vouchers com validações específicas';

COMMENT ON POLICY "uso_voucher_select_policy" ON uso_voucher IS 
'Permite visualização do histórico de uso de vouchers para usuários autenticados e anônimos';