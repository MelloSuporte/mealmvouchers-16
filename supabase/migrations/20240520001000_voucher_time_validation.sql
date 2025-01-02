-- Create base time validation function
CREATE OR REPLACE FUNCTION validate_voucher_time_and_shift(
    p_hora_atual TIME,
    p_tipo_refeicao_id UUID,
    p_turno_id UUID
) RETURNS JSONB
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
    v_tipo_refeicao RECORD;
    v_turno RECORD;
BEGIN
    -- Get meal type information
    SELECT 
        horario_inicio,
        horario_fim,
        minutos_tolerancia,
        ativo
    INTO v_tipo_refeicao
    FROM tipos_refeicao
    WHERE id = p_tipo_refeicao_id;

    IF NOT FOUND OR NOT v_tipo_refeicao.ativo THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Tipo de refeição inválido ou inativo'
        );
    END IF;

    -- Get shift information
    SELECT 
        horario_inicio,
        horario_fim,
        ativo
    INTO v_turno
    FROM turnos
    WHERE id = p_turno_id;

    IF NOT FOUND OR NOT v_turno.ativo THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Turno inválido ou inativo'
        );
    END IF;

    -- Validate meal time
    IF v_tipo_refeicao.horario_inicio IS NOT NULL AND v_tipo_refeicao.horario_fim IS NOT NULL THEN
        IF p_hora_atual < v_tipo_refeicao.horario_inicio OR 
           p_hora_atual > v_tipo_refeicao.horario_fim + (v_tipo_refeicao.minutos_tolerancia || ' minutes')::INTERVAL THEN
            RETURN jsonb_build_object(
                'success', false,
                'error', format('Esta refeição só pode ser utilizada entre %s e %s (tolerância de %s minutos)',
                    v_tipo_refeicao.horario_inicio::TEXT,
                    v_tipo_refeicao.horario_fim::TEXT,
                    v_tipo_refeicao.minutos_tolerancia::TEXT
                )
            );
        END IF;
    END IF;

    RETURN jsonb_build_object('success', true);
END;
$$;