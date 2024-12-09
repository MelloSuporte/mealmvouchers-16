-- Drop existing function
DROP FUNCTION IF EXISTS insert_uso_voucher;

-- Recreate function with explicit search_path
CREATE OR REPLACE FUNCTION insert_uso_voucher(
    p_usuario_id UUID,
    p_tipo_refeicao_id UUID
)
RETURNS TABLE (
    uso_id INTEGER,
    nome_usuario VARCHAR,
    tipo_refeicao VARCHAR,
    valor_refeicao DECIMAL
)
SECURITY INVOKER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
    v_uso_id INTEGER;
    v_nome VARCHAR;
    v_tipo_refeicao VARCHAR;
    v_valor DECIMAL;
    v_tipo_refeicao_ativo BOOLEAN;
    v_usuario_suspenso BOOLEAN;
    v_uso_hoje INTEGER;
    v_max_usos INTEGER;
BEGIN
    -- Verificar se o tipo de refeição está ativo
    SELECT ativo, max_usuarios_por_dia INTO v_tipo_refeicao_ativo, v_max_usos
    FROM tipos_refeicao
    WHERE id = p_tipo_refeicao_id;

    IF NOT FOUND OR NOT v_tipo_refeicao_ativo THEN
        RAISE EXCEPTION 'Tipo de refeição inválido ou inativo';
    END IF;

    -- Verificar se o usuário está suspenso
    SELECT suspenso INTO v_usuario_suspenso
    FROM usuarios
    WHERE id = p_usuario_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Usuário não encontrado';
    END IF;

    IF v_usuario_suspenso THEN
        RAISE EXCEPTION 'Usuário está suspenso';
    END IF;

    -- Verificar limite diário de usos
    IF v_max_usos IS NOT NULL THEN
        SELECT COUNT(*) INTO v_uso_hoje
        FROM uso_voucher
        WHERE usuario_id = p_usuario_id
        AND tipo_refeicao_id = p_tipo_refeicao_id
        AND DATE(usado_em) = CURRENT_DATE;

        IF v_uso_hoje >= v_max_usos THEN
            RAISE EXCEPTION 'Limite diário de usos atingido para este tipo de refeição';
        END IF;
    END IF;

    -- Inserir registro de uso
    INSERT INTO uso_voucher (
        usuario_id,
        tipo_refeicao_id,
        usado_em
    ) 
    VALUES (
        p_usuario_id,
        p_tipo_refeicao_id,
        CURRENT_TIMESTAMP
    )
    RETURNING id INTO v_uso_id;

    -- Buscar detalhes do uso na view
    SELECT 
        vw.nome_usuario,
        vw.tipo_refeicao,
        vw.valor_refeicao
    INTO
        v_nome,
        v_tipo_refeicao,
        v_valor
    FROM vw_uso_voucher_detalhado vw
    WHERE vw.uso_id = v_uso_id;

    -- Retornar os detalhes do uso
    RETURN QUERY
    SELECT 
        v_uso_id,
        v_nome,
        v_tipo_refeicao,
        v_valor;
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Erro ao registrar uso do voucher: %', SQLERRM;
END;
$$;

-- Set function permissions
REVOKE ALL ON FUNCTION insert_uso_voucher FROM PUBLIC;
GRANT EXECUTE ON FUNCTION insert_uso_voucher TO authenticated;

-- Add comment
COMMENT ON FUNCTION insert_uso_voucher IS 'Registra o uso de um voucher com validações de segurança e regras de negócio';
