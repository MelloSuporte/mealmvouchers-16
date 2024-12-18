-- Função para validar horário da refeição
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
    -- Obter configuração do horário da refeição
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

    -- Se não houver restrição de horário, permitir
    IF v_horario_inicio IS NULL OR v_horario_fim IS NULL THEN
        RETURN TRUE;
    END IF;

    -- Verificar se o horário atual está dentro do intervalo permitido
    RETURN p_hora_atual BETWEEN v_horario_inicio 
        AND v_horario_fim + (v_tolerancia || ' minutes')::INTERVAL;
END;
$$;

-- Permissões
REVOKE ALL ON FUNCTION check_meal_time(UUID, TIME) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION check_meal_time(UUID, TIME) TO authenticated;

-- Comentário
COMMENT ON FUNCTION check_meal_time IS 
'Valida se o horário atual está dentro do intervalo permitido para refeição';