--Drop existing policies
DROP POLICY IF EXISTS "vouchers_comuns_select_policy" ON vouchers_comuns;
DROP POLICY IF EXISTS "vouchers_comuns_insert_policy" ON vouchers_comuns;

--Enable RLS
ALTER TABLE vouchers_comuns ENABLE ROW LEVEL SECURITY;

--Select policy with meal type validation
CREATE POLICY "vouchers_comuns_select_policy" ON vouchers_comuns
    FOR SELECT TO authenticated, anon
    USING (
        usado_em IS NULL
        AND EXISTS (
            SELECT 1 FROM tipos_refeicao tr
            WHERE tr.id = tipo_refeicao_id
            AND tr.ativo = true
            AND CURRENT_TIME BETWEEN tr.horario_inicio 
            AND (tr.horario_fim + (tr.minutos_tolerancia || ' minutes')::INTERVAL)
        )
        AND EXISTS (
            SELECT 1 FROM turnos t
            WHERE t.id = turno_id
            AND t.ativo = true
            AND CURRENT_TIME BETWEEN t.horario_inicio AND t.horario_fim
        )
    );

--Insert policy for system only
CREATE POLICY "vouchers_comuns_insert_policy" ON vouchers_comuns
    FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM admin_users au
            WHERE au.id = auth.uid()
            AND au.permissoes->>'sistema' = 'true'
        )
        AND
        EXISTS (
            SELECT 1 FROM tipos_refeicao tr
            WHERE tr.id = tipo_refeicao_id
            AND tr.ativo = true
        )
        AND
        EXISTS (
            SELECT 1 FROM turnos t
            WHERE t.id = turno_id
            AND t.ativo = true
        )
    );

--Add helpful comments
COMMENT ON POLICY "vouchers_comuns_select_policy" ON vouchers_comuns IS 
'Permite visualizar vouchers comuns apenas dentro do horário permitido do turno e tipo de refeição';

COMMENT ON POLICY "vouchers_comuns_insert_policy" ON vouchers_comuns IS
'Permite apenas o sistema criar vouchers comuns com validação de turno e tipo de refeição';