-- Drop existing functions and policies
DROP FUNCTION IF EXISTS validate_voucher_time_and_shift CASCADE;
DROP FUNCTION IF EXISTS validate_voucher_usage_limits CASCADE;
DROP FUNCTION IF EXISTS validate_and_use_voucher CASCADE;

-- Create base validation function for time and shift
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
    -- Validate meal time
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

    -- Validate shift time
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

    -- Check minimum interval
    IF v_ultima_refeicao IS NOT NULL AND 
       v_ultima_refeicao + INTERVAL '3 hours' > CURRENT_TIMESTAMP THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Intervalo mínimo entre refeições não respeitado'
        );
    END IF;

    RETURN jsonb_build_object('success', true);
END;
$$;

-- Main validation and usage function
CREATE OR REPLACE FUNCTION validate_and_use_voucher(
    p_codigo VARCHAR(4),
    p_tipo_refeicao_id UUID
) RETURNS JSONB
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
    v_usuario_id UUID;
    v_turno_id UUID;
    v_empresa_id UUID;
    v_hora_atual TIME;
    v_tipo_refeicao RECORD;
    v_turno RECORD;
    v_validation_result JSONB;
BEGIN
    -- Set configuration for RLS
    PERFORM set_config('voucher.validated', 'true', true);
    
    v_hora_atual := CURRENT_TIME;

    -- Find user and validate basic conditions
    SELECT u.id, u.turno_id, u.empresa_id
    INTO v_usuario_id, v_turno_id, v_empresa_id
    FROM usuarios u
    WHERE u.voucher = p_codigo
    AND NOT u.suspenso
    AND EXISTS (
        SELECT 1 FROM empresas e
        WHERE e.id = u.empresa_id
        AND e.ativo = true
    );

    IF NOT FOUND THEN
        PERFORM set_config('voucher.validated', 'false', true);
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Voucher inválido ou usuário suspenso'
        );
    END IF;

    -- Get meal type information
    SELECT * INTO v_tipo_refeicao
    FROM tipos_refeicao
    WHERE id = p_tipo_refeicao_id
    AND ativo = true;

    IF NOT FOUND THEN
        PERFORM set_config('voucher.validated', 'false', true);
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Tipo de refeição inválido ou inativo'
        );
    END IF;

    -- Get shift information
    SELECT * INTO v_turno
    FROM turnos
    WHERE id = v_turno_id
    AND ativo = true;

    IF NOT FOUND THEN
        PERFORM set_config('voucher.validated', 'false', true);
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Turno inválido ou inativo'
        );
    END IF;

    -- Validate time and shift
    v_validation_result := validate_voucher_time_and_shift(v_hora_atual, v_tipo_refeicao, v_turno);
    IF NOT (v_validation_result->>'success')::boolean THEN
        PERFORM set_config('voucher.validated', 'false', true);
        RETURN v_validation_result;
    END IF;

    -- Validate usage limits
    v_validation_result := validate_voucher_usage_limits(v_usuario_id);
    IF NOT (v_validation_result->>'success')::boolean THEN
        PERFORM set_config('voucher.validated', 'false', true);
        RETURN v_validation_result;
    END IF;

    -- Register usage
    INSERT INTO uso_voucher (
        usuario_id,
        tipo_refeicao_id,
        usado_em
    ) VALUES (
        v_usuario_id,
        p_tipo_refeicao_id,
        CURRENT_TIMESTAMP
    );

    -- Reset configuration
    PERFORM set_config('voucher.validated', 'false', true);

    RETURN jsonb_build_object(
        'success', true,
        'message', 'Voucher validado com sucesso'
    );

EXCEPTION
    WHEN OTHERS THEN
        -- Ensure configuration is reset even on error
        PERFORM set_config('voucher.validated', 'false', true);
        RETURN jsonb_build_object(
            'success', false,
            'error', SQLERRM
        );
END;
$$;

-- Set proper permissions
REVOKE ALL ON FUNCTION validate_voucher_time_and_shift(TIME, RECORD, RECORD) FROM PUBLIC;
REVOKE ALL ON FUNCTION validate_voucher_usage_limits(UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION validate_and_use_voucher(VARCHAR, UUID) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION validate_voucher_time_and_shift(TIME, RECORD, RECORD) TO authenticated;
GRANT EXECUTE ON FUNCTION validate_voucher_usage_limits(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION validate_and_use_voucher(VARCHAR, UUID) TO authenticated, anon;

-- Add documentation
COMMENT ON FUNCTION validate_voucher_time_and_shift IS 'Valida horários de refeição e turno';
COMMENT ON FUNCTION validate_voucher_usage_limits IS 'Valida limites de uso do voucher';
COMMENT ON FUNCTION validate_and_use_voucher IS 'Função principal para validação e uso de vouchers';

-- Update RLS policies
DROP POLICY IF EXISTS "enforce_voucher_validation_on_insert" ON uso_voucher;
DROP POLICY IF EXISTS "allow_view_usage_history" ON uso_voucher;

ALTER TABLE uso_voucher ENABLE ROW LEVEL SECURITY;

CREATE POLICY "enforce_voucher_validation_on_insert" ON uso_voucher
    FOR INSERT TO authenticated, anon
    WITH CHECK (
        current_setting('voucher.validated', true)::boolean = true
    );

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