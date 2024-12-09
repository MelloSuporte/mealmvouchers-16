-- Drop existing policies if any
DROP POLICY IF EXISTS "logs_sistema_select_policy" ON logs_sistema;
DROP POLICY IF EXISTS "logs_sistema_insert_policy" ON logs_sistema;
DROP POLICY IF EXISTS "logs_sistema_update_policy" ON logs_sistema;
DROP POLICY IF EXISTS "logs_sistema_delete_policy" ON logs_sistema;

-- Temporarily disable RLS
ALTER TABLE logs_sistema DISABLE ROW LEVEL SECURITY;

-- Enable RLS
ALTER TABLE logs_sistema ENABLE ROW LEVEL SECURITY;

-- Create policies for logs_sistema table
CREATE POLICY "logs_sistema_select_policy"
ON logs_sistema FOR SELECT
TO authenticated
USING (
    -- Apenas admins com permissão específica podem ver os logs
    EXISTS (
        SELECT 1
        FROM admin_users au
        WHERE au.id = auth.uid()
        AND (
            au.permissoes->>'gerenciar_logs' = 'true'
            OR au.permissoes->>'gerenciar_relatorios' = 'true'
        )
        AND NOT au.suspenso
    )
);

CREATE POLICY "logs_sistema_insert_policy"
ON logs_sistema FOR INSERT
TO authenticated
WITH CHECK (
    -- Apenas através da função insert_log_sistema
    (SELECT current_setting('app.inserting_log_sistema', true)) = 'true'
);

-- No update or delete policies as logs should never be modified or deleted

-- Grant proper permissions
GRANT SELECT ON logs_sistema TO authenticated;
GRANT INSERT ON logs_sistema TO authenticated;
GRANT ALL ON logs_sistema TO service_role;

-- Create helper function for inserting logs
CREATE OR REPLACE FUNCTION insert_log_sistema(
    p_tipo VARCHAR,
    p_mensagem TEXT,
    p_detalhes JSONB DEFAULT NULL,
    p_nivel VARCHAR DEFAULT 'info'
)
RETURNS logs_sistema
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
    v_result logs_sistema;
BEGIN
    -- Validar o nível do log
    IF p_nivel NOT IN ('debug', 'info', 'warning', 'error', 'critical') THEN
        RAISE EXCEPTION 'Nível de log inválido. Deve ser: debug, info, warning, error ou critical';
    END IF;

    -- Configurar variável de ambiente para a política RLS
    PERFORM set_config('app.inserting_log_sistema', 'true', true);

    -- Inserir o log
    INSERT INTO logs_sistema (
        tipo,
        mensagem,
        detalhes,
        nivel,
        usuario_id,
        ip_address,
        user_agent,
        criado_em
    )
    VALUES (
        p_tipo,
        p_mensagem,
        COALESCE(p_detalhes, '{}'::jsonb),
        p_nivel,
        auth.uid(),
        COALESCE(current_setting('request.headers', true)::jsonb->>'x-real-ip', 'unknown'),
        COALESCE(current_setting('request.headers', true)::jsonb->>'user-agent', 'unknown'),
        CURRENT_TIMESTAMP
    )
    RETURNING * INTO v_result;

    -- Limpar variável de ambiente
    PERFORM set_config('app.inserting_log_sistema', 'false', true);

    RETURN v_result;
EXCEPTION
    WHEN OTHERS THEN
        -- Garantir que a variável de ambiente seja limpa em caso de erro
        PERFORM set_config('app.inserting_log_sistema', 'false', true);
        RAISE EXCEPTION 'Erro ao inserir log: %', SQLERRM;
END;
$$;

-- Set function permissions
ALTER FUNCTION insert_log_sistema(VARCHAR, TEXT, JSONB, VARCHAR) OWNER TO postgres;
REVOKE ALL ON FUNCTION insert_log_sistema(VARCHAR, TEXT, JSONB, VARCHAR) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION insert_log_sistema(VARCHAR, TEXT, JSONB, VARCHAR) TO authenticated;

-- Add comment
COMMENT ON FUNCTION insert_log_sistema IS 'Insere um log no sistema com validações de segurança';

-- Create helper function for retrieving logs with filtering
CREATE OR REPLACE FUNCTION get_logs_sistema(
    p_tipo VARCHAR DEFAULT NULL,
    p_nivel VARCHAR DEFAULT NULL,
    p_data_inicio TIMESTAMP DEFAULT NULL,
    p_data_fim TIMESTAMP DEFAULT NULL,
    p_limite INTEGER DEFAULT 100
)
RETURNS SETOF logs_sistema
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
    -- Verificar se o usuário tem permissão
    IF NOT EXISTS (
        SELECT 1
        FROM admin_users au
        WHERE au.id = auth.uid()
        AND (
            au.permissoes->>'gerenciar_logs' = 'true'
            OR au.permissoes->>'gerenciar_relatorios' = 'true'
        )
        AND NOT au.suspenso
    ) THEN
        RAISE EXCEPTION 'Usuário não tem permissão para visualizar logs';
    END IF;

    -- Validar o limite
    IF p_limite > 1000 THEN
        RAISE EXCEPTION 'Limite máximo de registros é 1000';
    END IF;

    -- Retornar logs filtrados
    RETURN QUERY
    SELECT *
    FROM logs_sistema
    WHERE (p_tipo IS NULL OR tipo = p_tipo)
    AND (p_nivel IS NULL OR nivel = p_nivel)
    AND (p_data_inicio IS NULL OR criado_em >= p_data_inicio)
    AND (p_data_fim IS NULL OR criado_em <= p_data_fim)
    ORDER BY criado_em DESC
    LIMIT p_limite;
END;
$$;

-- Set function permissions
ALTER FUNCTION get_logs_sistema(VARCHAR, VARCHAR, TIMESTAMP, TIMESTAMP, INTEGER) OWNER TO postgres;
REVOKE ALL ON FUNCTION get_logs_sistema(VARCHAR, VARCHAR, TIMESTAMP, TIMESTAMP, INTEGER) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION get_logs_sistema(VARCHAR, VARCHAR, TIMESTAMP, TIMESTAMP, INTEGER) TO authenticated;

-- Add comment
COMMENT ON FUNCTION get_logs_sistema IS 'Retorna logs do sistema com filtros e validações de segurança';
