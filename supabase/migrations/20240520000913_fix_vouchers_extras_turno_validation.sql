-- Drop existing policies
DROP POLICY IF EXISTS "vouchers_extras_select_policy" ON vouchers_extras;
DROP POLICY IF EXISTS "vouchers_extras_insert_policy" ON vouchers_extras;
DROP POLICY IF EXISTS "vouchers_extras_update_policy" ON vouchers_extras;

-- Enable RLS
ALTER TABLE vouchers_extras ENABLE ROW LEVEL SECURITY;

-- Select policy with meal type validation
CREATE POLICY "vouchers_extras_select_policy" ON vouchers_extras
    FOR SELECT TO authenticated, anon
    USING (
        (
            usuario_id = auth.uid()
            OR 
            EXISTS (
                SELECT 1 FROM usuarios u
                WHERE u.id = auth.uid()
                AND u.role IN ('admin', 'gestor')
                AND NOT u.suspenso
            )
        )
        AND
        EXISTS (
            SELECT 1 FROM tipos_refeicao tr
            WHERE tr.id = tipo_refeicao_id
            AND tr.ativo = true
            AND CURRENT_TIME BETWEEN tr.horario_inicio 
            AND (tr.horario_fim + (tr.minutos_tolerancia || ' minutes')::INTERVAL)
        )
        AND
        EXISTS (
            SELECT 1 FROM usuarios u
            JOIN turnos t ON t.id = u.turno_id
            WHERE u.id = vouchers_extras.usuario_id
            AND t.ativo = true
            AND CURRENT_TIME BETWEEN t.horario_inicio AND t.horario_fim
        )
    );

-- Insert policy with validations
CREATE POLICY "vouchers_extras_insert_policy" ON vouchers_extras
    FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM usuarios u
            WHERE u.id = auth.uid()
            AND u.role IN ('admin', 'gestor')
            AND NOT u.suspenso
        )
        AND
        EXISTS (
            SELECT 1 FROM tipos_refeicao tr
            WHERE tr.id = tipo_refeicao_id
            AND tr.ativo = true
        )
        AND
        EXISTS (
            SELECT 1 FROM usuarios u
            JOIN turnos t ON t.id = u.turno_id
            WHERE u.id = usuario_id
            AND t.ativo = true
        )
    );

COMMENT ON POLICY "vouchers_extras_select_policy" ON vouchers_extras IS 
'Permite visualizar vouchers extras apenas dentro do horário permitido do turno e tipo de refeição';

COMMENT ON POLICY "vouchers_extras_insert_policy" ON vouchers_extras IS
'Permite apenas admins/gestores criarem vouchers extras com validação de turno e tipo de refeição';