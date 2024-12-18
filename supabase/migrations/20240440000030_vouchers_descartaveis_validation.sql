-- Drop existing policies
DROP POLICY IF EXISTS "vouchers_descartaveis_select_policy" ON vouchers_descartaveis;
DROP POLICY IF EXISTS "vouchers_descartaveis_update_policy" ON vouchers_descartaveis;

-- Enable RLS
ALTER TABLE vouchers_descartaveis ENABLE ROW LEVEL SECURITY;

-- Create base validation function
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

-- Create select policy with validation
CREATE POLICY "vouchers_descartaveis_select_policy" ON vouchers_descartaveis
    FOR SELECT
    USING (
        NOT usado
        AND CURRENT_DATE <= data_expiracao::date
        AND validate_voucher_descartavel(codigo, tipo_refeicao_id)
    );

-- Create update policy
CREATE POLICY "vouchers_descartaveis_update_policy" ON vouchers_descartaveis
    FOR UPDATE
    USING (NOT usado)
    WITH CHECK (
        usado = true
        AND id = id
        AND tipo_refeicao_id = tipo_refeicao_id
        AND codigo = codigo
        AND data_expiracao = data_expiracao
    );

-- Grant permissions
GRANT SELECT, UPDATE ON vouchers_descartaveis TO authenticated;
GRANT EXECUTE ON FUNCTION validate_voucher_descartavel TO authenticated;

-- Add comments
COMMENT ON FUNCTION validate_voucher_descartavel IS 'Validates if a disposable voucher can be used based on meal time and expiration';
COMMENT ON POLICY "vouchers_descartaveis_select_policy" ON vouchers_descartaveis IS 'Allows viewing valid and unused vouchers during meal times';
COMMENT ON POLICY "vouchers_descartaveis_update_policy" ON vouchers_descartaveis IS 'Allows marking vouchers as used while preserving other fields';