-- Drop existing policies
DROP POLICY IF EXISTS "uso_voucher_insert_policy" ON uso_voucher;
DROP POLICY IF EXISTS "uso_voucher_select_policy" ON uso_voucher;

-- Enable RLS
ALTER TABLE uso_voucher ENABLE ROW LEVEL SECURITY;

-- Create unified insert policy with proper validation for disposable vouchers
CREATE POLICY "uso_voucher_insert_voucher_descartaveis_policy" ON uso_voucher
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
        -- Allow anonymous users to register disposable voucher usage with strict validation
        (
            EXISTS (
                SELECT 1 
                FROM vouchers_descartaveis vd
                JOIN tipos_refeicao tr ON tr.id = vd.tipo_refeicao_id
                WHERE vd.id = voucher_descartavel_id
                -- Garantir que o voucher não foi usado
                AND vd.usado_em IS NULL
                -- Garantir que o código existe
                AND vd.codigo IS NOT NULL
                -- Verificar validade
                AND CURRENT_DATE <= vd.data_expiracao::date
                -- Verificar se o tipo de refeição está ativo
                AND tr.ativo = true
                -- Verificar se está dentro do horário permitido
                AND CURRENT_TIME BETWEEN tr.horario_inicio 
                AND (tr.horario_fim + (tr.minutos_tolerancia || ' minutes')::INTERVAL)
                -- Garantir que o tipo de refeição é o mesmo para o qual o voucher foi gerado
                AND vd.tipo_refeicao_id = tipo_refeicao_id
                -- Verificar se não existe uso anterior deste voucher
                AND NOT EXISTS (
                    SELECT 1 
                    FROM uso_voucher uv 
                    WHERE uv.voucher_descartavel_id = vd.id
                )
            )
        )
    );

-- Create select policy
CREATE POLICY "uso_voucher_select_policy" ON uso_voucher
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
            AND voucher_descartavel_id IS NOT NULL
        )
    );

-- Grant necessary permissions
GRANT SELECT, INSERT ON uso_voucher TO anon;
GRANT SELECT ON tipos_refeicao TO anon;
GRANT SELECT ON vouchers_descartaveis TO anon;

-- Add helpful comments
COMMENT ON POLICY "uso_voucher_insert_voucher_descartaveis_policy" ON uso_voucher IS 
'Permite que usuários anônimos registrem uso de vouchers descartáveis com validações específicas de uso único e tipo de refeição';

COMMENT ON POLICY "uso_voucher_select_policy" ON uso_voucher IS 
'Permite visualização do histórico de uso de vouchers para usuários autenticados e anônimos';