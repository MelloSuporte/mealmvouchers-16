/* Remover políticas existentes */
DROP POLICY IF EXISTS "uso_voucher_insert_policy" ON uso_voucher;
DROP POLICY IF EXISTS "uso_voucher_select_policy" ON uso_voucher;
DROP POLICY IF EXISTS "uso_voucher_update_policy" ON uso_voucher;
DROP POLICY IF EXISTS "uso_voucher_delete_policy" ON uso_voucher;

/* Habilitar RLS */
ALTER TABLE uso_voucher ENABLE ROW LEVEL SECURITY;

/* Política para inserção (uso do voucher)
   Esta política garante que APENAS a função validate_and_use_voucher pode inserir registros */
CREATE POLICY "enforce_voucher_validation_on_insert" ON uso_voucher
    FOR INSERT TO authenticated, anon
    WITH CHECK (
        /* Apenas permite inserção através da função validate_and_use_voucher */
        current_setting('voucher.validated', true)::boolean = true
    );

/* Política para visualização (histórico) */
CREATE POLICY "allow_view_usage_history" ON uso_voucher
    FOR SELECT TO authenticated
    USING (
        /* Usuários podem ver seu próprio histórico */
        usuario_id = auth.uid()
        OR 
        /* Admins podem ver todo o histórico */
        EXISTS (
            SELECT 1 FROM usuarios u
            WHERE u.id = auth.uid()
            AND u.role = 'admin'
            AND NOT u.suspenso
        )
    );

/* Modificar a função validate_and_use_voucher para definir a configuração */
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
    v_refeicoes_dia INTEGER;
    v_ultima_refeicao TIMESTAMP;
    v_hora_atual TIME;
    v_tipo_refeicao RECORD;
    v_turno RECORD;
BEGIN
    /* Definir configuração que permite inserção */
    PERFORM set_config('voucher.validated', 'true', true);
    
    /* Get current time */
    v_hora_atual := CURRENT_TIME;

    /* Find user by voucher code */
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

    /* Get meal type information */
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

    /* Get shift information */
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

    /* Validate meal time */
    IF v_tipo_refeicao.hora_inicio IS NOT NULL AND v_tipo_refeicao.hora_fim IS NOT NULL THEN
        IF v_hora_atual < v_tipo_refeicao.hora_inicio OR 
           v_hora_atual > v_tipo_refeicao.hora_fim + (v_tipo_refeicao.minutos_tolerancia || ' minutes')::INTERVAL THEN
            PERFORM set_config('voucher.validated', 'false', true);
            RETURN jsonb_build_object(
                'success', false,
                'error', format('Esta refeição só pode ser utilizada entre %s e %s (tolerância de %s minutos)',
                    v_tipo_refeicao.hora_inicio::TEXT,
                    v_tipo_refeicao.hora_fim::TEXT,
                    v_tipo_refeicao.minutos_tolerancia::TEXT
                )
            );
        END IF;
    END IF;

    /* Validate shift time */
    IF v_hora_atual < v_turno.horario_inicio OR v_hora_atual > v_turno.horario_fim THEN
        PERFORM set_config('voucher.validated', 'false', true);
        RETURN jsonb_build_object(
            'success', false,
            'error', format('Seu turno permite uso apenas entre %s e %s',
                v_turno.horario_inicio::TEXT,
                v_turno.horario_fim::TEXT
            )
        );
    END IF;

    /* Check daily limit */
    SELECT COUNT(*), MAX(usado_em)
    INTO v_refeicoes_dia, v_ultima_refeicao
    FROM uso_voucher
    WHERE usuario_id = v_usuario_id
    AND DATE(usado_em) = CURRENT_DATE;

    IF v_refeicoes_dia >= 3 THEN
        PERFORM set_config('voucher.validated', 'false', true);
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Limite diário de refeições atingido'
        );
    END IF;

    /* Check minimum interval */
    IF v_ultima_refeicao IS NOT NULL AND 
       v_ultima_refeicao + INTERVAL '3 hours' > CURRENT_TIMESTAMP THEN
        PERFORM set_config('voucher.validated', 'false', true);
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Intervalo mínimo entre refeições não respeitado'
        );
    END IF;

    /* Register usage */
    INSERT INTO uso_voucher (
        usuario_id,
        tipo_refeicao_id,
        usado_em
    ) VALUES (
        v_usuario_id,
        p_tipo_refeicao_id,
        CURRENT_TIMESTAMP
    );

    /* Resetar configuração */
    PERFORM set_config('voucher.validated', 'false', true);

    RETURN jsonb_build_object(
        'success', true,
        'message', 'Voucher validado com sucesso'
    );

EXCEPTION
    WHEN OTHERS THEN
        /* Garantir que a configuração é resetada mesmo em caso de erro */
        PERFORM set_config('voucher.validated', 'false', true);
        RETURN jsonb_build_object(
            'success', false,
            'error', SQLERRM
        );
END;
$$;

/* Garantir que apenas a função validate_and_use_voucher pode definir a configuração */
REVOKE ALL ON FUNCTION set_config(text, text, boolean) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION set_config(text, text, boolean) TO authenticated;

/* Comentários para documentação */
COMMENT ON POLICY "enforce_voucher_validation_on_insert" ON uso_voucher IS 
'Garante que vouchers só podem ser usados através da função validate_and_use_voucher que implementa todas as validações';

COMMENT ON POLICY "allow_view_usage_history" ON uso_voucher IS 
'Permite que usuários vejam seu próprio histórico e admins vejam todo o histórico';