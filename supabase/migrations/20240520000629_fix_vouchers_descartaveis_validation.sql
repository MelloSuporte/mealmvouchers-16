-- Drop existing function if it exists
DROP FUNCTION IF EXISTS validate_disposable_voucher CASCADE;

-- First fix the column type
DO $$ 
BEGIN
    -- First create a temporary column
    ALTER TABLE vouchers_descartaveis 
    ADD COLUMN usado_em_temp TIMESTAMP WITH TIME ZONE;

    -- Update the temporary column
    UPDATE vouchers_descartaveis 
    SET usado_em_temp = CASE 
        WHEN usado_em = true THEN CURRENT_TIMESTAMP 
        ELSE NULL 
    END;

    -- Drop the old column
    ALTER TABLE vouchers_descartaveis 
    DROP COLUMN usado_em;

    -- Rename the temporary column
    ALTER TABLE vouchers_descartaveis 
    RENAME COLUMN usado_em_temp TO usado_em;
EXCEPTION
    WHEN others THEN
        -- Log the error but continue
        RAISE NOTICE 'Error during column migration: %', SQLERRM;
END $$;

-- Create or replace the validation function
CREATE OR REPLACE FUNCTION validate_disposable_voucher(
    p_codigo VARCHAR,
    p_tipo_refeicao_id UUID
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_voucher RECORD;
    v_tipo_refeicao RECORD;
BEGIN
    -- Get voucher details
    SELECT *
    INTO v_voucher
    FROM vouchers_descartaveis
    WHERE codigo = p_codigo
    AND tipo_refeicao_id = p_tipo_refeicao_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Voucher descartável não encontrado'
        );
    END IF;

    -- Check if already used
    IF v_voucher.usado_em IS NOT NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Voucher descartável já foi utilizado'
        );
    END IF;

    -- Get meal type details
    SELECT *
    INTO v_tipo_refeicao
    FROM tipos_refeicao
    WHERE id = p_tipo_refeicao_id;

    -- Validate time
    IF NOT (CURRENT_TIME BETWEEN v_tipo_refeicao.horario_inicio 
        AND v_tipo_refeicao.horario_fim + (v_tipo_refeicao.minutos_tolerancia || ' minutes')::INTERVAL) THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', format('Esta refeição só pode ser utilizada entre %s e %s',
                v_tipo_refeicao.horario_inicio::TEXT,
                v_tipo_refeicao.horario_fim::TEXT
            )
        );
    END IF;

    -- Mark as used
    UPDATE vouchers_descartaveis
    SET usado_em = CURRENT_TIMESTAMP
    WHERE codigo = p_codigo;

    RETURN jsonb_build_object(
        'success', true,
        'message', 'Voucher descartável validado com sucesso'
    );
END;
$$;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION validate_disposable_voucher(VARCHAR, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION validate_disposable_voucher(VARCHAR, UUID) TO anon;