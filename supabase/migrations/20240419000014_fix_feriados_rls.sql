-- Drop existing policies if any
DROP POLICY IF EXISTS "feriados_select_policy" ON feriados;
DROP POLICY IF EXISTS "feriados_insert_policy" ON feriados;
DROP POLICY IF EXISTS "feriados_update_policy" ON feriados;
DROP POLICY IF EXISTS "feriados_delete_policy" ON feriados;

-- Temporarily disable RLS
ALTER TABLE feriados DISABLE ROW LEVEL SECURITY;

-- Enable RLS
ALTER TABLE feriados ENABLE ROW LEVEL SECURITY;

-- Create policies for feriados table
CREATE POLICY "feriados_select_policy"
ON feriados FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "feriados_insert_policy"
ON feriados FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1
        FROM admin_users au
        WHERE au.id = auth.uid()
        AND au.permissoes->>'gerenciar_feriados' = 'true'
        AND NOT au.suspenso
    )
);

CREATE POLICY "feriados_update_policy"
ON feriados FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM admin_users au
        WHERE au.id = auth.uid()
        AND au.permissoes->>'gerenciar_feriados' = 'true'
        AND NOT au.suspenso
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1
        FROM admin_users au
        WHERE au.id = auth.uid()
        AND au.permissoes->>'gerenciar_feriados' = 'true'
        AND NOT au.suspenso
    )
);

CREATE POLICY "feriados_delete_policy"
ON feriados FOR DELETE
TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM admin_users au
        WHERE au.id = auth.uid()
        AND au.permissoes->>'gerenciar_feriados' = 'true'
        AND NOT au.suspenso
    )
);

-- Grant proper permissions
GRANT SELECT ON feriados TO authenticated;
GRANT INSERT, UPDATE, DELETE ON feriados TO authenticated;
GRANT ALL ON feriados TO service_role;

-- Create helper function for managing holidays
CREATE OR REPLACE FUNCTION manage_feriado(
    p_data DATE,
    p_descricao VARCHAR,
    p_tipo VARCHAR DEFAULT 'fixo',
    p_ativo BOOLEAN DEFAULT true
)
RETURNS feriados
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
    v_result feriados;
BEGIN
    -- Verificar se o usuário tem permissão
    IF NOT EXISTS (
        SELECT 1
        FROM admin_users au
        WHERE au.id = auth.uid()
        AND au.permissoes->>'gerenciar_feriados' = 'true'
        AND NOT au.suspenso
    ) THEN
        RAISE EXCEPTION 'Usuário não tem permissão para gerenciar feriados';
    END IF;

    -- Validar tipo de feriado
    IF p_tipo NOT IN ('fixo', 'movel') THEN
        RAISE EXCEPTION 'Tipo de feriado inválido. Deve ser ''fixo'' ou ''movel''';
    END IF;

    -- Inserir ou atualizar feriado
    INSERT INTO feriados (
        data,
        descricao,
        tipo,
        ativo,
        criado_em,
        atualizado_em
    )
    VALUES (
        p_data,
        p_descricao,
        p_tipo,
        p_ativo,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    )
    ON CONFLICT (data) DO UPDATE
    SET
        descricao = EXCLUDED.descricao,
        tipo = EXCLUDED.tipo,
        ativo = EXCLUDED.ativo,
        atualizado_em = CURRENT_TIMESTAMP
    RETURNING * INTO v_result;

    RETURN v_result;
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Erro ao gerenciar feriado: %', SQLERRM;
END;
$$;

-- Set function permissions
ALTER FUNCTION manage_feriado(DATE, VARCHAR, VARCHAR, BOOLEAN) OWNER TO postgres;
REVOKE ALL ON FUNCTION manage_feriado(DATE, VARCHAR, VARCHAR, BOOLEAN) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION manage_feriado(DATE, VARCHAR, VARCHAR, BOOLEAN) TO authenticated;

-- Add comment
COMMENT ON FUNCTION manage_feriado IS 'Gerencia feriados com validações de segurança';

-- Create helper function to check if a date is a holiday
CREATE OR REPLACE FUNCTION is_feriado(
    p_data DATE
)
RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM feriados
        WHERE data = p_data
        AND ativo = true
    );
END;
$$;

-- Set function permissions
ALTER FUNCTION is_feriado(DATE) OWNER TO postgres;
REVOKE ALL ON FUNCTION is_feriado(DATE) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION is_feriado(DATE) TO authenticated;

-- Add comment
COMMENT ON FUNCTION is_feriado IS 'Verifica se uma data é feriado';
