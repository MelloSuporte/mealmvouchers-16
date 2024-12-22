-- Drop existing policies if they exist
DROP POLICY IF EXISTS "tipos_refeicao_select_policy" ON tipos_refeicao;
DROP POLICY IF EXISTS "tipos_refeicao_insert_policy" ON tipos_refeicao;
DROP POLICY IF EXISTS "tipos_refeicao_update_policy" ON tipos_refeicao;
DROP POLICY IF EXISTS "tipos_refeicao_delete_policy" ON tipos_refeicao;

-- Enable RLS
ALTER TABLE tipos_refeicao ENABLE ROW LEVEL SECURITY;

-- Políticas de Leitura (SELECT)
CREATE POLICY "tipos_refeicao_select_policy" ON tipos_refeicao
    FOR SELECT TO authenticated, anon
    USING (true);

-- Políticas de Inserção (INSERT)
CREATE POLICY "tipos_refeicao_insert_policy" ON tipos_refeicao
    FOR INSERT TO authenticated
    WITH CHECK (
        (
            -- Administradores podem inserir
            EXISTS (
                SELECT 1 FROM usuarios u
                WHERE u.id = auth.uid()
                AND u.role = 'admin'
                AND NOT u.suspenso
            )
        ) OR (
            -- Gestores com permissões específicas podem inserir
            EXISTS (
                SELECT 1 FROM admin_users au
                WHERE au.id = auth.uid()
                AND au.permissoes->>'gerenciar_refeicoes' = 'true'
                AND NOT au.suspenso
            )
        )
    );

-- Políticas de Atualização (UPDATE)
CREATE POLICY "tipos_refeicao_update_policy" ON tipos_refeicao
    FOR UPDATE TO authenticated
    USING (
        (
            -- Administradores podem atualizar
            EXISTS (
                SELECT 1 FROM usuarios u
                WHERE u.id = auth.uid()
                AND u.role = 'admin'
                AND NOT u.suspenso
            )
        ) OR (
            -- Gestores com permissões específicas podem atualizar
            EXISTS (
                SELECT 1 FROM admin_users au
                WHERE au.id = auth.uid()
                AND au.permissoes->>'gerenciar_refeicoes' = 'true'
                AND NOT au.suspenso
            )
        )
    );

-- Políticas de Deleção (DELETE)
CREATE POLICY "tipos_refeicao_delete_policy" ON tipos_refeicao
    FOR DELETE TO authenticated
    USING (
        (
            -- Administradores podem deletar
            EXISTS (
                SELECT 1 FROM usuarios u
                WHERE u.id = auth.uid()
                AND u.role = 'admin'
                AND NOT u.suspenso
            )
        ) OR (
            -- Gestores com permissões específicas podem deletar
            EXISTS (
                SELECT 1 FROM admin_users au
                WHERE au.id = auth.uid()
                AND au.permissoes->>'gerenciar_refeicoes' = 'true'
                AND NOT au.suspenso
            )
        )
    );

-- Função para validar horário da refeição
CREATE OR REPLACE FUNCTION check_meal_time_rules(
    p_tipo_refeicao_id UUID,
    p_usuario_id UUID,
    p_turno_id UUID
) RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
    v_count INTEGER;
    v_horario_atual TIME;
    v_horario_inicio TIME;
    v_horario_fim TIME;
    v_tolerancia INTEGER;
BEGIN
    -- Obter horário atual
    v_horario_atual := CURRENT_TIME;

    -- Verificar horário da refeição
    SELECT 
        horario_inicio,
        horario_fim,
        minutos_tolerancia
    INTO 
        v_horario_inicio,
        v_horario_fim,
        v_tolerancia
    FROM tipos_refeicao
    WHERE id = p_tipo_refeicao_id
    AND ativo = true;

    -- Verificar se está dentro do horário permitido
    IF v_horario_inicio IS NOT NULL AND v_horario_fim IS NOT NULL THEN
        IF v_horario_atual NOT BETWEEN v_horario_inicio 
            AND v_horario_fim + (v_tolerancia || ' minutes')::INTERVAL THEN
            RETURN FALSE;
        END IF;
    END IF;

    -- Verificar limite de vouchers por turno
    SELECT COUNT(*)
    INTO v_count
    FROM uso_voucher uv
    WHERE uv.usuario_id = p_usuario_id
    AND uv.turno_id = p_turno_id
    AND DATE(uv.usado_em) = CURRENT_DATE;

    -- Permitir no máximo 2 vouchers diferentes por turno
    IF v_count >= 2 THEN
        RETURN FALSE;
    END IF;

    -- Verificar se já usou este tipo de refeição
    SELECT COUNT(*)
    INTO v_count
    FROM uso_voucher uv
    WHERE uv.usuario_id = p_usuario_id
    AND uv.tipo_refeicao_id = p_tipo_refeicao_id
    AND DATE(uv.usado_em) = CURRENT_DATE;

    -- Não permitir usar o mesmo tipo de refeição mais de uma vez
    IF v_count > 0 THEN
        RETURN FALSE;
    END IF;

    RETURN TRUE;
END;
$$;

-- Grant necessary permissions
GRANT ALL ON tipos_refeicao TO authenticated;
GRANT SELECT ON tipos_refeicao TO anon;
GRANT ALL ON tipos_refeicao TO service_role;
GRANT EXECUTE ON FUNCTION check_meal_time_rules TO authenticated;

-- Add documentation
COMMENT ON TABLE tipos_refeicao IS 'Tabela de tipos de refeição com políticas RLS e regras de negócio';
COMMENT ON FUNCTION check_meal_time_rules IS 'Função que valida as regras de horário e uso de vouchers por tipo de refeição';