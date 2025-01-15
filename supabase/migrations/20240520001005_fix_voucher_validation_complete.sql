-- Drop existing policies
DROP POLICY IF EXISTS "vouchers_descartaveis_select_policy" ON vouchers_descartaveis;
DROP POLICY IF EXISTS "vouchers_descartaveis_update_policy" ON vouchers_descartaveis;
DROP POLICY IF EXISTS "uso_voucher_insert_policy" ON uso_voucher;

-- Enable RLS
ALTER TABLE vouchers_descartaveis ENABLE ROW LEVEL SECURITY;
ALTER TABLE uso_voucher ENABLE ROW LEVEL SECURITY;

-- Create select policy with proper validation for vouchers_descartaveis
CREATE POLICY "vouchers_descartaveis_select_policy" ON vouchers_descartaveis
    FOR SELECT TO authenticated, anon
    USING (
        -- Allow selection of unused vouchers within validity period
        usado_em IS NULL 
        AND CURRENT_DATE <= data_expiracao::date
        AND codigo IS NOT NULL
        AND EXISTS (
            SELECT 1 FROM tipos_refeicao tr
            WHERE tr.id = tipo_refeicao_id
            AND tr.ativo = true
            AND CURRENT_TIME BETWEEN tr.horario_inicio 
            AND (tr.horario_fim + (tr.minutos_tolerancia || ' minutes')::INTERVAL)
        )
    );

-- Create update policy for vouchers_descartaveis
CREATE POLICY "vouchers_descartaveis_update_policy" ON vouchers_descartaveis
    FOR UPDATE TO authenticated, anon
    USING (
        usado_em IS NULL 
        AND CURRENT_DATE <= data_expiracao::date
        AND EXISTS (
            SELECT 1 FROM tipos_refeicao tr
            WHERE tr.id = tipo_refeicao_id
            AND tr.ativo = true
            AND CURRENT_TIME BETWEEN tr.horario_inicio 
            AND (tr.horario_fim + (tr.minutos_tolerancia || ' minutes')::INTERVAL)
        )
    )
    WITH CHECK (
        usado_em IS NOT NULL
        AND data_uso IS NOT NULL
    );

-- Create insert policy for uso_voucher with proper validation
CREATE POLICY "uso_voucher_insert_policy" ON uso_voucher
    FOR INSERT TO authenticated, anon
    WITH CHECK (
        -- For disposable vouchers
        (
            voucher_descartavel_id IS NOT NULL
            AND EXISTS (
                SELECT 1 
                FROM vouchers_descartaveis vd
                JOIN tipos_refeicao tr ON tr.id = vd.tipo_refeicao_id
                WHERE vd.id = voucher_descartavel_id
                AND vd.usado_em IS NULL
                AND vd.data_uso IS NULL
                AND CURRENT_DATE <= vd.data_expiracao::date
                AND tr.ativo = true
                AND CURRENT_TIME BETWEEN tr.horario_inicio 
                AND (tr.horario_fim + (tr.minutos_tolerancia || ' minutes')::INTERVAL)
            )
        )
        OR
        -- For common vouchers
        (
            usuario_id IS NOT NULL
            AND EXISTS (
                SELECT 1 
                FROM usuarios u
                JOIN empresas e ON e.id = u.empresa_id
                WHERE u.id = usuario_id
                AND NOT u.suspenso
                AND e.ativo = true
            )
        )
    );

-- Create function to validate and use disposable voucher
CREATE OR REPLACE FUNCTION validate_and_use_disposable_voucher(
    p_voucher_id UUID,
    p_tipo_refeicao_id UUID
) RETURNS JSONB
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
    v_voucher RECORD;
BEGIN
    -- Get voucher with validation
    SELECT vd.* 
    INTO v_voucher
    FROM vouchers_descartaveis vd
    JOIN tipos_refeicao tr ON tr.id = vd.tipo_refeicao_id
    WHERE vd.id = p_voucher_id
    AND vd.usado_em IS NULL
    AND vd.data_uso IS NULL
    AND CURRENT_DATE <= vd.data_expiracao::date
    AND tr.ativo = true
    AND CURRENT_TIME BETWEEN tr.horario_inicio 
    AND (tr.horario_fim + (tr.minutos_tolerancia || ' minutes')::INTERVAL)
    FOR UPDATE SKIP LOCKED;

    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Voucher inválido, expirado ou fora do horário permitido'
        );
    END IF;

    -- Update voucher status
    UPDATE vouchers_descartaveis
    SET 
        usado_em = CURRENT_TIMESTAMP,
        data_uso = CURRENT_TIMESTAMP
    WHERE id = p_voucher_id;

    -- Register usage
    INSERT INTO uso_voucher (
        voucher_descartavel_id,
        tipo_refeicao_id,
        usado_em
    ) VALUES (
        p_voucher_id,
        p_tipo_refeicao_id,
        CURRENT_TIMESTAMP
    );

    RETURN jsonb_build_object(
        'success', true,
        'message', 'Voucher validado com sucesso'
    );

EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', SQLERRM
        );
END;
$$;

-- Grant necessary permissions
GRANT SELECT, UPDATE ON vouchers_descartaveis TO anon;
GRANT SELECT ON tipos_refeicao TO anon;
GRANT INSERT ON uso_voucher TO anon;
GRANT EXECUTE ON FUNCTION validate_and_use_disposable_voucher TO anon;

-- Add helpful comments
COMMENT ON POLICY "vouchers_descartaveis_select_policy" ON vouchers_descartaveis IS 
'Permite visualizar vouchers válidos para validação e uso';

COMMENT ON POLICY "vouchers_descartaveis_update_policy" ON vouchers_descartaveis IS 
'Permite marcar vouchers como usados quando dentro do horário permitido';

COMMENT ON POLICY "uso_voucher_insert_policy" ON uso_voucher IS 
'Permite registrar uso de vouchers com validações específicas para cada tipo';