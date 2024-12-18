-- Create function to validate meal time
CREATE OR REPLACE FUNCTION check_meal_time(
    p_tipo_refeicao_id UUID,
    p_hora_atual TIME DEFAULT CURRENT_TIME
) RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
    v_horario_inicio TIME;
    v_horario_fim TIME;
    v_tolerancia INTEGER;
BEGIN
    -- Get meal time configuration
    SELECT 
        horario_inicio,
        horario_fim,
        minutos_tolerancia
    INTO 
        v_horario_inicio,
        v_horario_fim,
        v_tolerancia
    FROM tipos_refeicao
    WHERE id = p_tipo_refeicao_id
    AND ativo = true;

    -- If no time restriction, allow
    IF v_horario_inicio IS NULL OR v_horario_fim IS NULL THEN
        RETURN TRUE;
    END IF;

    -- Check if current time is within allowed interval
    RETURN p_hora_atual BETWEEN v_horario_inicio 
        AND v_horario_fim + (v_tolerancia || ' minutes')::INTERVAL;
END;
$$;

-- Set permissions
REVOKE ALL ON FUNCTION check_meal_time(UUID, TIME) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION check_meal_time(UUID, TIME) TO authenticated;