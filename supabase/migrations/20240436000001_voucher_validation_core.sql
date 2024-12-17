/* Core validation function */
CREATE OR REPLACE FUNCTION validate_voucher_time_and_shift(
    p_hora_atual TIME,
    p_tipo_refeicao RECORD,
    p_turno RECORD
) RETURNS JSONB AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;