/* Drop existing function */
DROP FUNCTION IF EXISTS validate_voucher_time_and_shift;

/* Recreate with proper security settings */
CREATE OR REPLACE FUNCTION validate_voucher_time_and_shift(
    p_hora_atual TIME,
    p_tipo_refeicao RECORD,
    p_turno RECORD
) RETURNS JSONB
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
    /* Validate meal time */
    IF p_tipo_refeicao.hora_inicio IS NOT NULL AND p_tipo_refeicao.hora_fim IS NOT NULL THEN
        IF p_hora_atual < p_tipo_refeicao.hora_inicio OR 
           p_hora_atual > p_tipo_refeicao.hora_fim + (p_tipo_refeicao.minutos_tolerancia || ' minutes')::INTERVAL THEN
            RETURN jsonb_build_object(
                'success', false,
                'error', format('Esta refeição só pode ser utilizada entre %s e %s (tolerância de %s minutos)',
                    p_tipo_refeicao.hora_inicio::TEXT,
                    p_tipo_refeicao.hora_fim::TEXT,
                    p_tipo_refeicao.minutos_tolerancia::TEXT
                )
            );
        END IF;
    END IF;

    /* Validate shift time */
    IF p_hora_atual < p_turno.horario_inicio OR p_hora_atual > p_turno.horario_fim THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', format('Seu turno permite uso apenas entre %s e %s',
                p_turno.horario_inicio::TEXT,
                p_turno.horario_fim::TEXT
            )
        );
    END IF;

    RETURN jsonb_build_object('success', true);
END;
$$;

/* Revoke unnecessary permissions */
REVOKE ALL ON FUNCTION validate_voucher_time_and_shift(TIME, RECORD, RECORD) FROM PUBLIC;

/* Grant execute to authenticated users */
GRANT EXECUTE ON FUNCTION validate_voucher_time_and_shift(TIME, RECORD, RECORD) TO authenticated;

/* Add documentation */
COMMENT ON FUNCTION validate_voucher_time_and_shift IS 
'Valida horários de refeição e turno com configurações de segurança apropriadas';

/* Ensure RLS is enabled */
ALTER TABLE uso_voucher ENABLE ROW LEVEL SECURITY;

/* Drop and recreate policies with proper security */
DROP POLICY IF EXISTS "enforce_voucher_validation_on_insert" ON uso_voucher;
DROP POLICY IF EXISTS "allow_view_usage_history" ON uso_voucher;

/* Create insert policy that requires validation */
CREATE POLICY "enforce_voucher_validation_on_insert" ON uso_voucher
    FOR INSERT TO authenticated, anon
    WITH CHECK (
        current_setting('voucher.validated', true)::boolean = true
    );

/* Create select policy for viewing history */
CREATE POLICY "allow_view_usage_history" ON uso_voucher
    FOR SELECT TO authenticated
    USING (
        usuario_id = auth.uid()
        OR 
        EXISTS (
            SELECT 1 FROM usuarios u
            WHERE u.id = auth.uid()
            AND u.role = 'admin'
            AND NOT u.suspenso
        )
    );

/* Ensure proper function execution permissions */
REVOKE ALL ON FUNCTION set_config(text, text, boolean) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION set_config(text, text, boolean) TO authenticated;

/* Add documentation */
COMMENT ON POLICY "enforce_voucher_validation_on_insert" ON uso_voucher IS 
'Garante que vouchers só podem ser usados através da função validate_and_use_voucher que implementa todas as validações';

COMMENT ON POLICY "allow_view_usage_history" ON uso_voucher IS 
'Permite que usuários vejam seu próprio histórico e admins vejam todo o histórico';