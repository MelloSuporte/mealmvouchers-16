-- Drop existing function
DROP FUNCTION IF EXISTS validate_and_use_voucher;

-- Create function to validate and use voucher
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
    v_result JSONB;
    v_voucher_descartavel RECORD;
    v_tipo_refeicao RECORD;
BEGIN
    -- Set validation flag
    PERFORM set_config('voucher.validated', 'true', true);

    -- Log início da validação
    RAISE NOTICE 'Iniciando validação do voucher: %', p_codigo;

    -- Verificar se o tipo de refeição existe e está ativo
    SELECT * INTO v_tipo_refeicao
    FROM tipos_refeicao
    WHERE id = p_tipo_refeicao_id
    AND ativo = true;

    IF NOT FOUND THEN
        RAISE NOTICE 'Tipo de refeição inválido ou inativo: %', p_tipo_refeicao_id;
        PERFORM set_config('voucher.validated', 'false', true);
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Tipo de refeição inválido ou inativo'
        );
    END IF;

    -- Primeiro tenta encontrar um voucher descartável válido
    SELECT *
    INTO v_voucher_descartavel
    FROM vouchers_descartaveis vd
    WHERE vd.codigo = p_codigo
    AND vd.tipo_refeicao_id = p_tipo_refeicao_id
    AND NOT vd.usado
    AND CURRENT_DATE <= vd.data_expiracao::date
    FOR UPDATE SKIP LOCKED;  -- Prevenir condições de corrida

    -- Se encontrou um voucher descartável válido
    IF FOUND THEN
        RAISE NOTICE 'Voucher descartável encontrado: %', v_voucher_descartavel.id;

        -- Verificar horário da refeição
        IF NOT (CURRENT_TIME BETWEEN v_tipo_refeicao.horario_inicio 
            AND (v_tipo_refeicao.horario_fim + (v_tipo_refeicao.minutos_tolerancia || ' minutes')::INTERVAL)) THEN
            RAISE NOTICE 'Fora do horário permitido: % - %', v_tipo_refeicao.horario_inicio, v_tipo_refeicao.horario_fim;
            PERFORM set_config('voucher.validated', 'false', true);
            RETURN jsonb_build_object(
                'success', false,
                'error', format('Esta refeição só pode ser utilizada entre %s e %s',
                    v_tipo_refeicao.horario_inicio::TEXT,
                    v_tipo_refeicao.horario_fim::TEXT
                )
            );
        END IF;

        -- Marcar voucher como usado
        UPDATE vouchers_descartaveis
        SET 
            usado = true,
            data_uso = CURRENT_TIMESTAMP
        WHERE id = v_voucher_descartavel.id
        AND NOT usado;  -- Garantir que não foi usado entre a verificação e o update

        IF NOT FOUND THEN
            RAISE NOTICE 'Voucher já foi utilizado entre a verificação e atualização';
            PERFORM set_config('voucher.validated', 'false', true);
            RETURN jsonb_build_object(
                'success', false,
                'error', 'Este voucher já foi utilizado'
            );
        END IF;

        -- Registrar uso
        INSERT INTO uso_voucher (
            tipo_refeicao_id,
            usado_em
        ) VALUES (
            p_tipo_refeicao_id,
            CURRENT_TIMESTAMP
        );

        RAISE NOTICE 'Voucher descartável validado com sucesso';
        PERFORM set_config('voucher.validated', 'false', true);

        RETURN jsonb_build_object(
            'success', true,
            'message', 'Voucher descartável validado com sucesso'
        );
    END IF;

    -- Se não encontrou voucher descartável, tenta voucher comum
    SELECT u.id, u.turno_id, u.empresa_id
    INTO v_usuario_id, v_turno_id, v_empresa_id
    FROM usuarios u
    WHERE u.voucher = p_codigo
    AND NOT u.suspenso
    AND EXISTS (
        SELECT 1 FROM empresas e
        WHERE e.id = u.empresa_id
        AND e.ativo = true
    )
    FOR UPDATE SKIP LOCKED;  -- Prevenir condições de corrida

    IF NOT FOUND THEN
        RAISE NOTICE 'Voucher comum não encontrado ou usuário suspenso';
        PERFORM set_config('voucher.validated', 'false', true);
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Voucher inválido ou usuário suspenso'
        );
    END IF;

    -- Verificar horário da refeição para voucher comum
    IF NOT (CURRENT_TIME BETWEEN v_tipo_refeicao.horario_inicio 
        AND (v_tipo_refeicao.horario_fim + (v_tipo_refeicao.minutos_tolerancia || ' minutes')::INTERVAL)) THEN
        RAISE NOTICE 'Fora do horário permitido: % - %', v_tipo_refeicao.horario_inicio, v_tipo_refeicao.horario_fim;
        PERFORM set_config('voucher.validated', 'false', true);
        RETURN jsonb_build_object(
            'success', false,
            'error', format('Esta refeição só pode ser utilizada entre %s e %s',
                v_tipo_refeicao.horario_inicio::TEXT,
                v_tipo_refeicao.horario_fim::TEXT
            )
        );
    END IF;

    -- Register usage for common voucher
    INSERT INTO uso_voucher (
        usuario_id,
        tipo_refeicao_id,
        usado_em
    ) VALUES (
        v_usuario_id,
        p_tipo_refeicao_id,
        CURRENT_TIMESTAMP
    );

    RAISE NOTICE 'Voucher comum validado com sucesso';
    PERFORM set_config('voucher.validated', 'false', true);

    RETURN jsonb_build_object(
        'success', true,
        'message', 'Voucher validado com sucesso'
    );

EXCEPTION
    WHEN OTHERS THEN
        -- Ensure flag is reset on error
        RAISE NOTICE 'Erro ao validar voucher: %', SQLERRM;
        PERFORM set_config('voucher.validated', 'false', true);
        RETURN jsonb_build_object(
            'success', false,
            'error', SQLERRM
        );
END;
$$;

-- Grant permissions
REVOKE ALL ON FUNCTION validate_and_use_voucher FROM PUBLIC;
GRANT EXECUTE ON FUNCTION validate_and_use_voucher TO authenticated;
GRANT EXECUTE ON FUNCTION validate_and_use_voucher TO anon;

-- Add comment
COMMENT ON FUNCTION validate_and_use_voucher IS 
'Valida e registra o uso de um voucher (comum ou descartável) com todas as regras de negócio';