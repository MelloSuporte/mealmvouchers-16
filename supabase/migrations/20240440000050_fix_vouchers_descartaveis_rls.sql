-- Drop existing policies
DROP POLICY IF EXISTS "vouchers_descartaveis_select_policy" ON vouchers_descartaveis;
DROP POLICY IF EXISTS "vouchers_descartaveis_update_policy" ON vouchers_descartaveis;
DROP POLICY IF EXISTS "vouchers_descartaveis_insert_policy" ON vouchers_descartaveis;

-- Enable RLS
ALTER TABLE vouchers_descartaveis ENABLE ROW LEVEL SECURITY;

-- Create select policy with proper validation
CREATE POLICY "vouchers_descartaveis_select_policy" ON vouchers_descartaveis
    FOR SELECT TO authenticated
    USING (
        -- Voucher não usado e dentro da validade
        NOT usado 
        AND CURRENT_DATE <= data_expiracao::date
        AND
        -- Dentro do horário permitido para o tipo de refeição
        EXISTS (
            SELECT 1 FROM tipos_refeicao tr
            WHERE tr.id = tipo_refeicao_id
            AND tr.ativo = true
            AND CURRENT_TIME BETWEEN tr.horario_inicio 
            AND (tr.horario_fim + (tr.minutos_tolerancia || ' minutes')::INTERVAL)
        )
        OR
        -- Admins e gestores podem visualizar todos
        EXISTS (
            SELECT 1 FROM usuarios u
            WHERE u.id = auth.uid()
            AND u.role IN ('admin', 'gestor')
            AND NOT u.suspenso
        )
    );

-- Create update policy to allow marking as used
CREATE POLICY "vouchers_descartaveis_update_policy" ON vouchers_descartaveis
    FOR UPDATE TO authenticated
    USING (NOT usado)
    WITH CHECK (
        usado = true
        AND id = id
        AND tipo_refeicao_id = tipo_refeicao_id
        AND codigo = codigo
        AND data_expiracao = data_expiracao
    );

-- Create insert policy for admins and managers
CREATE POLICY "vouchers_descartaveis_insert_policy" ON vouchers_descartaveis
    FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM usuarios u
            WHERE u.id = auth.uid()
            AND u.role IN ('admin', 'gestor')
            AND NOT u.suspenso
        )
    );

-- Grant necessary permissions
GRANT SELECT, UPDATE ON vouchers_descartaveis TO authenticated;

-- Add helpful comments
COMMENT ON POLICY "vouchers_descartaveis_select_policy" ON vouchers_descartaveis IS 
'Permite visualizar apenas vouchers válidos, não utilizados e dentro do horário permitido';

COMMENT ON POLICY "vouchers_descartaveis_update_policy" ON vouchers_descartaveis IS 
'Permite apenas marcar vouchers como usados mantendo outros campos inalterados';

COMMENT ON POLICY "vouchers_descartaveis_insert_policy" ON vouchers_descartaveis IS
'Permite apenas administradores e gestores criarem novos vouchers';