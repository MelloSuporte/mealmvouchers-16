-- Drop existing policies if any
DROP POLICY IF EXISTS "uso_voucher_select_policy" ON uso_voucher;
DROP POLICY IF EXISTS "uso_voucher_insert_policy" ON uso_voucher;
DROP POLICY IF EXISTS "uso_voucher_update_policy" ON uso_voucher;
DROP POLICY IF EXISTS "uso_voucher_delete_policy" ON uso_voucher;

-- Temporarily disable RLS
ALTER TABLE uso_voucher DISABLE ROW LEVEL SECURITY;

-- Enable RLS
ALTER TABLE uso_voucher ENABLE ROW LEVEL SECURITY;

-- Create policies for uso_voucher table
CREATE POLICY "uso_voucher_select_policy"
ON uso_voucher FOR SELECT
TO authenticated
USING (
    -- Admins podem ver todos os registros
    EXISTS (
        SELECT 1
        FROM admin_users au
        WHERE au.id = auth.uid()
        AND (
            au.permissoes->>'gerenciar_relatorios' = 'true'
            OR au.permissoes->>'gerenciar_vouchers_extra' = 'true'
            OR au.permissoes->>'gerenciar_vouchers_descartaveis' = 'true'
        )
        AND NOT au.suspenso
    )
    OR
    -- Usuários podem ver seus próprios registros
    usuario_id = auth.uid()
);

CREATE POLICY "uso_voucher_insert_policy"
ON uso_voucher FOR INSERT
TO authenticated
WITH CHECK (
    -- Apenas através da função insert_uso_voucher
    (SELECT current_setting('app.inserting_uso_voucher', true)) = 'true'
);

-- Grant proper permissions
GRANT SELECT ON uso_voucher TO authenticated;
GRANT INSERT ON uso_voucher TO authenticated;
GRANT ALL ON uso_voucher TO service_role;

-- Drop and recreate the function with proper security context
DROP FUNCTION IF EXISTS insert_uso_voucher;

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
SECURITY DEFINER
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
    v_is_feriado BOOLEAN;
BEGIN
    -- Verificar se o usuário está autenticado
    IF auth.role() != 'authenticated' THEN
        RAISE EXCEPTION 'Usuário não autenticado';
    END IF;

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

    -- Verificar se é feriado
    SELECT * FROM is_feriado(CURRENT_DATE) INTO v_is_feriado;

    -- Verificar limite diário de usos
    IF v_max_usos IS NOT NULL AND NOT v_is_feriado THEN
        SELECT COUNT(*) INTO v_uso_hoje
        FROM uso_voucher
        WHERE usuario_id = p_usuario_id
        AND tipo_refeicao_id = p_tipo_refeicao_id
        AND DATE(usado_em) = CURRENT_DATE;

        IF v_uso_hoje >= v_max_usos THEN
            RAISE EXCEPTION 'Limite diário de usos atingido para este tipo de refeição';
        END IF;
    END IF;

    -- Configurar variável de ambiente para a política RLS
    PERFORM set_config('app.inserting_uso_voucher', 'true', true);

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

    -- Limpar variável de ambiente
    PERFORM set_config('app.inserting_uso_voucher', 'false', true);

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
        -- Garantir que a variável de ambiente seja limpa em caso de erro
        PERFORM set_config('app.inserting_uso_voucher', 'false', true);
        RAISE EXCEPTION 'Erro ao registrar uso do voucher: %', SQLERRM;
END;
$$;

-- Set function permissions
ALTER FUNCTION insert_uso_voucher(UUID, UUID) OWNER TO postgres;
REVOKE ALL ON FUNCTION insert_uso_voucher(UUID, UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION insert_uso_voucher(UUID, UUID) TO authenticated;

-- Add comment
COMMENT ON FUNCTION insert_uso_voucher IS 'Registra o uso de um voucher com validações de segurança e regras de negócio';
