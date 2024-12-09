-- Drop existing policies if any
DROP POLICY IF EXISTS "configuracoes_select_policy" ON configuracoes;
DROP POLICY IF EXISTS "configuracoes_insert_policy" ON configuracoes;
DROP POLICY IF EXISTS "configuracoes_update_policy" ON configuracoes;
DROP POLICY IF EXISTS "configuracoes_delete_policy" ON configuracoes;

-- Temporarily disable RLS
ALTER TABLE configuracoes DISABLE ROW LEVEL SECURITY;

-- Enable RLS
ALTER TABLE configuracoes ENABLE ROW LEVEL SECURITY;

-- Create policies for configuracoes table
CREATE POLICY "configuracoes_select_policy"
ON configuracoes FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "configuracoes_insert_policy"
ON configuracoes FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1
        FROM admin_users au
        WHERE au.id = auth.uid()
        AND au.permissoes->>'gerenciar_configuracoes' = 'true'
        AND NOT au.suspenso
    )
);

CREATE POLICY "configuracoes_update_policy"
ON configuracoes FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM admin_users au
        WHERE au.id = auth.uid()
        AND au.permissoes->>'gerenciar_configuracoes' = 'true'
        AND NOT au.suspenso
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1
        FROM admin_users au
        WHERE au.id = auth.uid()
        AND au.permissoes->>'gerenciar_configuracoes' = 'true'
        AND NOT au.suspenso
    )
);

CREATE POLICY "configuracoes_delete_policy"
ON configuracoes FOR DELETE
TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM admin_users au
        WHERE au.id = auth.uid()
        AND au.permissoes->>'gerenciar_configuracoes' = 'true'
        AND NOT au.suspenso
    )
);

-- Grant proper permissions
GRANT SELECT ON configuracoes TO authenticated;
GRANT INSERT, UPDATE, DELETE ON configuracoes TO authenticated;
GRANT ALL ON configuracoes TO service_role;

-- Create helper function for managing configurations
CREATE OR REPLACE FUNCTION manage_configuracao(
    p_chave VARCHAR,
    p_valor JSONB,
    p_descricao TEXT DEFAULT NULL
)
RETURNS configuracoes
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
    v_result configuracoes;
BEGIN
    -- Verificar se o usuário tem permissão
    IF NOT EXISTS (
        SELECT 1
        FROM admin_users au
        WHERE au.id = auth.uid()
        AND au.permissoes->>'gerenciar_configuracoes' = 'true'
        AND NOT au.suspenso
    ) THEN
        RAISE EXCEPTION 'Usuário não tem permissão para gerenciar configurações';
    END IF;

    -- Inserir ou atualizar configuração
    INSERT INTO configuracoes (
        chave,
        valor,
        descricao,
        atualizado_em
    )
    VALUES (
        p_chave,
        p_valor,
        COALESCE(p_descricao, 'Configuração do sistema'),
        CURRENT_TIMESTAMP
    )
    ON CONFLICT (chave) DO UPDATE
    SET
        valor = EXCLUDED.valor,
        descricao = COALESCE(EXCLUDED.descricao, configuracoes.descricao),
        atualizado_em = CURRENT_TIMESTAMP
    RETURNING * INTO v_result;

    RETURN v_result;
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Erro ao gerenciar configuração: %', SQLERRM;
END;
$$;

-- Set function permissions
ALTER FUNCTION manage_configuracao(VARCHAR, JSONB, TEXT) OWNER TO postgres;
REVOKE ALL ON FUNCTION manage_configuracao(VARCHAR, JSONB, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION manage_configuracao(VARCHAR, JSONB, TEXT) TO authenticated;

-- Add comment
COMMENT ON FUNCTION manage_configuracao IS 'Gerencia configurações do sistema com validações de segurança';
