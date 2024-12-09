-- Drop existing policies
DROP POLICY IF EXISTS "vouchers_descartaveis_select_policy" ON vouchers_descartaveis;
DROP POLICY IF EXISTS "vouchers_descartaveis_insert_policy" ON vouchers_descartaveis;
DROP POLICY IF EXISTS "vouchers_descartaveis_update_policy" ON vouchers_descartaveis;
DROP POLICY IF EXISTS "vouchers_descartaveis_delete_policy" ON vouchers_descartaveis;

-- Add missing columns if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'vouchers_descartaveis' 
                  AND column_name = 'criado_por') THEN
        ALTER TABLE vouchers_descartaveis 
        ADD COLUMN criado_por UUID REFERENCES auth.users(id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'vouchers_descartaveis' 
                  AND column_name = 'criado_em') THEN
        ALTER TABLE vouchers_descartaveis 
        ADD COLUMN criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'vouchers_descartaveis' 
                  AND column_name = 'atualizado_em') THEN
        ALTER TABLE vouchers_descartaveis 
        ADD COLUMN atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
    END IF;
END $$;

-- Create trigger to update atualizado_em
CREATE OR REPLACE FUNCTION update_vouchers_descartaveis_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.atualizado_em = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_vouchers_descartaveis_updated_at_trigger ON vouchers_descartaveis;

CREATE TRIGGER update_vouchers_descartaveis_updated_at_trigger
    BEFORE UPDATE ON vouchers_descartaveis
    FOR EACH ROW
    EXECUTE FUNCTION update_vouchers_descartaveis_updated_at();

-- Enable RLS
ALTER TABLE vouchers_descartaveis ENABLE ROW LEVEL SECURITY;

-- Create new policies
CREATE POLICY "vouchers_descartaveis_select_policy"
ON vouchers_descartaveis FOR SELECT
TO authenticated
USING (
    -- Admins podem ver todos os vouchers
    EXISTS (
        SELECT 1 FROM admin_users au
        WHERE au.id = auth.uid()
        AND (
            au.permissoes->>'gerenciar_vouchers' = 'true'
            OR au.permissoes->>'gerenciar_relatorios' = 'true'
        )
        AND NOT au.suspenso
    )
    OR
    -- Usuários podem ver seus próprios vouchers
    criado_por = auth.uid()
    OR
    -- Usuários podem ver vouchers atribuídos a eles
    usuario_id = auth.uid()
);

CREATE POLICY "vouchers_descartaveis_insert_policy"
ON vouchers_descartaveis FOR INSERT
TO authenticated
WITH CHECK (
    -- Apenas via função insert_voucher_descartavel
    (current_setting('app.inserting_voucher_descartavel', true))::boolean
    OR
    -- Ou admins com permissão específica
    EXISTS (
        SELECT 1 FROM admin_users au
        WHERE au.id = auth.uid()
        AND au.permissoes->>'gerenciar_vouchers' = 'true'
        AND NOT au.suspenso
    )
);

CREATE POLICY "vouchers_descartaveis_update_policy"
ON vouchers_descartaveis FOR UPDATE
TO authenticated
USING (
    -- Apenas via função update_voucher_descartavel_status
    (current_setting('app.updating_voucher_descartavel', true))::boolean
    OR
    -- Ou admins com permissão específica
    EXISTS (
        SELECT 1 FROM admin_users au
        WHERE au.id = auth.uid()
        AND au.permissoes->>'gerenciar_vouchers' = 'true'
        AND NOT au.suspenso
    )
)
WITH CHECK (
    -- Apenas via função update_voucher_descartavel_status
    (current_setting('app.updating_voucher_descartavel', true))::boolean
    OR
    -- Ou admins com permissão específica
    EXISTS (
        SELECT 1 FROM admin_users au
        WHERE au.id = auth.uid()
        AND au.permissoes->>'gerenciar_vouchers' = 'true'
        AND NOT au.suspenso
    )
);

-- Update function to handle RLS properly
CREATE OR REPLACE FUNCTION insert_voucher_descartavel(
    p_tipo_refeicao VARCHAR,
    p_usuario_id UUID,
    p_quantidade INTEGER DEFAULT 1,
    p_observacao TEXT DEFAULT NULL,
    p_validade DATE DEFAULT (CURRENT_DATE + INTERVAL '7 days')::DATE
)
RETURNS SETOF vouchers_descartaveis
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
    v_voucher vouchers_descartaveis;
    i INTEGER;
BEGIN
    -- Verificar autenticação
    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'Usuário não autenticado';
    END IF;

    -- Verificar se o usuário tem permissão
    IF NOT EXISTS (
        SELECT 1 FROM admin_users au
        WHERE au.id = auth.uid()
        AND au.permissoes->>'gerenciar_vouchers' = 'true'
        AND NOT au.suspenso
    ) THEN
        RAISE EXCEPTION 'Usuário não tem permissão para gerar vouchers';
    END IF;

    -- Validar tipo de refeição
    IF NOT EXISTS (
        SELECT 1 FROM tipos_refeicao
        WHERE nome = p_tipo_refeicao
        AND ativo = true
    ) THEN
        RAISE EXCEPTION 'Tipo de refeição inválido ou inativo';
    END IF;

    -- Validar usuário destinatário
    IF NOT EXISTS (
        SELECT 1 FROM usuarios
        WHERE id = p_usuario_id
        AND NOT suspenso
    ) THEN
        RAISE EXCEPTION 'Usuário destinatário inválido ou suspenso';
    END IF;

    -- Validar quantidade
    IF p_quantidade < 1 OR p_quantidade > 100 THEN
        RAISE EXCEPTION 'Quantidade deve estar entre 1 e 100';
    END IF;

    -- Validar validade
    IF p_validade <= CURRENT_DATE THEN
        RAISE EXCEPTION 'Data de validade deve ser maior que a data atual';
    END IF;

    -- Configurar variável de ambiente para a política RLS
    PERFORM set_config('app.inserting_voucher_descartavel', 'true', true);

    -- Gerar vouchers
    FOR i IN 1..p_quantidade LOOP
        INSERT INTO vouchers_descartaveis (
            codigo,
            tipo_refeicao,
            usuario_id,
            validade,
            observacao,
            criado_por,
            criado_em,
            atualizado_em
        )
        VALUES (
            gen_random_uuid(), -- Código único para cada voucher
            p_tipo_refeicao,
            p_usuario_id,
            p_validade,
            p_observacao,
            auth.uid(),
            CURRENT_TIMESTAMP,
            CURRENT_TIMESTAMP
        )
        RETURNING * INTO v_voucher;

        RETURN NEXT v_voucher;
    END LOOP;

    -- Registrar log
    PERFORM insert_log_sistema(
        'voucher_descartavel',
        format('Gerados %s vouchers descartáveis para usuário %s', p_quantidade, p_usuario_id),
        jsonb_build_object(
            'tipo_refeicao', p_tipo_refeicao,
            'quantidade', p_quantidade,
            'validade', p_validade
        )
    );

    -- Limpar variável de ambiente
    PERFORM set_config('app.inserting_voucher_descartavel', 'false', true);

    RETURN;
EXCEPTION
    WHEN OTHERS THEN
        -- Garantir que a variável de ambiente seja limpa em caso de erro
        PERFORM set_config('app.inserting_voucher_descartavel', 'false', true);
        RAISE EXCEPTION 'Erro ao gerar vouchers: %', SQLERRM;
END;
$$;

-- Set function permissions
ALTER FUNCTION insert_voucher_descartavel(VARCHAR, UUID, INTEGER, TEXT, DATE) OWNER TO postgres;
REVOKE ALL ON FUNCTION insert_voucher_descartavel(VARCHAR, UUID, INTEGER, TEXT, DATE) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION insert_voucher_descartavel(VARCHAR, UUID, INTEGER, TEXT, DATE) TO authenticated;

-- Grant proper permissions
GRANT SELECT, INSERT, UPDATE ON vouchers_descartaveis TO authenticated;
GRANT ALL ON vouchers_descartaveis TO service_role;
