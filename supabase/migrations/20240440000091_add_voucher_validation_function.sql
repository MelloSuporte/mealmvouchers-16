-- Create or replace the validation function
CREATE OR REPLACE FUNCTION validate_voucher_descartavel(
    p_codigo VARCHAR(4),
    p_tipo_refeicao_id UUID
) RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
    v_hora_atual TIME;
    v_horario_inicio TIME;
    v_horario_fim TIME;
    v_tolerancia INTEGER;
BEGIN
    -- Get current time
    v_hora_atual := CURRENT_TIME;
    
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

    -- Validate voucher
    RETURN EXISTS (
        SELECT 1 
        FROM vouchers_descartaveis vd
        WHERE vd.codigo = p_codigo
        AND vd.tipo_refeicao_id = p_tipo_refeicao_id
        AND NOT vd.usado
        AND CURRENT_DATE <= vd.data_expiracao::date
        AND v_hora_atual BETWEEN v_horario_inicio 
            AND v_horario_fim + (v_tolerancia || ' minutes')::INTERVAL
    );
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION validate_voucher_descartavel TO authenticated;

-- Add comment
COMMENT ON FUNCTION validate_voucher_descartavel IS 
'Valida se um voucher descartável pode ser usado baseado no horário da refeição e expiração';