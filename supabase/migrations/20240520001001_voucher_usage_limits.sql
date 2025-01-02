-- Create usage limits validation function
CREATE OR REPLACE FUNCTION validate_voucher_usage_limits(
    p_usuario_id UUID
) RETURNS JSONB
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
    v_refeicoes_dia INTEGER;
    v_ultima_refeicao TIMESTAMP;
BEGIN
    -- Check daily limit
    SELECT COUNT(*), MAX(usado_em)
    INTO v_refeicoes_dia, v_ultima_refeicao
    FROM uso_voucher
    WHERE usuario_id = p_usuario_id
    AND DATE(usado_em) = CURRENT_DATE;

    IF v_refeicoes_dia >= 3 THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Limite diário de refeições atingido'
        );
    END IF;

    -- Check minimum interval (changed from 3 hours to 1 hour)
    IF v_ultima_refeicao IS NOT NULL AND 
       v_ultima_refeicao + INTERVAL '1 hour' > CURRENT_TIMESTAMP THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Intervalo mínimo entre refeições não respeitado (1 hora)'
        );
    END IF;

    RETURN jsonb_build_object('success', true);
END;
$$;