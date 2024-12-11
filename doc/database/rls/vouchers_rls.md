# Políticas RLS para Vouchers

## Tabela: vouchers_comuns
```sql
-- Habilitar RLS
ALTER TABLE vouchers_comuns ENABLE ROW LEVEL SECURITY;

-- Política de SELECT
CREATE POLICY "vouchers_comuns_select_policy" ON vouchers_comuns
    FOR SELECT TO authenticated
    USING (
        -- Usuário pode ver seu próprio voucher
        usuario_id = auth.uid()
        OR 
        -- Admins e gestores podem ver todos
        EXISTS (
            SELECT 1 FROM usuarios u
            WHERE u.id = auth.uid()
            AND u.role IN ('admin', 'gestor')
            AND NOT u.suspenso
        )
    );

-- Política de INSERT
CREATE POLICY "vouchers_comuns_insert_policy" ON vouchers_comuns
    FOR INSERT TO authenticated
    WITH CHECK (
        -- Apenas sistema pode gerar vouchers comuns
        EXISTS (
            SELECT 1 FROM usuarios u
            WHERE u.id = auth.uid()
            AND u.role = 'system'
        )
    );

-- Política de UPDATE
CREATE POLICY "vouchers_comuns_update_policy" ON vouchers_comuns
    FOR UPDATE TO authenticated
    USING (
        -- Apenas sistema pode atualizar vouchers
        EXISTS (
            SELECT 1 FROM usuarios u
            WHERE u.id = auth.uid()
            AND u.role = 'system'
        )
    );
```

## Tabela: vouchers_extras
```sql
-- Habilitar RLS
ALTER TABLE vouchers_extras ENABLE ROW LEVEL SECURITY;

-- Política de SELECT
CREATE POLICY "vouchers_extras_select_policy" ON vouchers_extras
    FOR SELECT TO authenticated
    USING (
        -- Usuário pode ver seus vouchers extras
        usuario_id = auth.uid()
        OR
        -- Gestores podem ver vouchers que autorizaram
        autorizado_por = auth.uid()
        OR
        -- Admins podem ver todos
        EXISTS (
            SELECT 1 FROM usuarios u
            WHERE u.id = auth.uid()
            AND u.role = 'admin'
            AND NOT u.suspenso
        )
    );

-- Política de INSERT
CREATE POLICY "vouchers_extras_insert_policy" ON vouchers_extras
    FOR INSERT TO authenticated
    WITH CHECK (
        -- Apenas gestores e admins podem criar
        EXISTS (
            SELECT 1 FROM usuarios u
            WHERE u.id = auth.uid()
            AND u.role IN ('admin', 'gestor')
            AND NOT u.suspenso
        )
    );

-- Política de UPDATE
CREATE POLICY "vouchers_extras_update_policy" ON vouchers_extras
    FOR UPDATE TO authenticated
    USING (
        -- Apenas quem autorizou ou admin pode atualizar
        autorizado_por = auth.uid()
        OR
        EXISTS (
            SELECT 1 FROM usuarios u
            WHERE u.id = auth.uid()
            AND u.role = 'admin'
            AND NOT u.suspenso
        )
    );
```

## Tabela: vouchers_descartaveis
```sql
-- Habilitar RLS
ALTER TABLE vouchers_descartaveis ENABLE ROW LEVEL SECURITY;

-- Política de SELECT
CREATE POLICY "vouchers_descartaveis_select_policy" ON vouchers_descartaveis
    FOR SELECT TO authenticated
    USING (
        -- Não usado pode ser visto por todos autenticados
        NOT usado
        OR
        -- Admins e gestores podem ver todos
        EXISTS (
            SELECT 1 FROM usuarios u
            WHERE u.id = auth.uid()
            AND u.role IN ('admin', 'gestor')
            AND NOT u.suspenso
        )
    );

-- Política de INSERT
CREATE POLICY "vouchers_descartaveis_insert_policy" ON vouchers_descartaveis
    FOR INSERT TO authenticated
    WITH CHECK (
        -- Apenas admins e gestores podem criar
        EXISTS (
            SELECT 1 FROM usuarios u
            WHERE u.id = auth.uid()
            AND u.role IN ('admin', 'gestor')
            AND NOT u.suspenso
        )
    );

-- Política de UPDATE
CREATE POLICY "vouchers_descartaveis_update_policy" ON vouchers_descartaveis
    FOR UPDATE TO authenticated
    USING (
        -- Apenas admins e gestores podem atualizar
        EXISTS (
            SELECT 1 FROM usuarios u
            WHERE u.id = auth.uid()
            AND u.role IN ('admin', 'gestor')
            AND NOT u.suspenso
        )
    );
```

## Tabela: uso_voucher
```sql
-- Habilitar RLS
ALTER TABLE uso_voucher ENABLE ROW LEVEL SECURITY;

-- Política de SELECT
CREATE POLICY "uso_voucher_select_policy" ON uso_voucher
    FOR SELECT TO authenticated
    USING (
        -- Usuário pode ver seu próprio histórico
        usuario_id = auth.uid()
        OR
        -- Admins e gestores podem ver todos
        EXISTS (
            SELECT 1 FROM usuarios u
            WHERE u.id = auth.uid()
            AND u.role IN ('admin', 'gestor')
            AND NOT u.suspenso
        )
    );

-- Política de INSERT
CREATE POLICY "uso_voucher_insert_policy" ON uso_voucher
    FOR INSERT TO authenticated
    WITH CHECK (
        -- Apenas sistema pode registrar uso
        EXISTS (
            SELECT 1 FROM usuarios u
            WHERE u.id = auth.uid()
            AND u.role = 'system'
        )
        -- Validações adicionais via triggers:
        -- - Limite diário de refeições
        -- - Intervalo entre refeições
        -- - Horário permitido para tipo de refeição
        -- - Turno do usuário
    );

-- Política de UPDATE
CREATE POLICY "uso_voucher_update_policy" ON uso_voucher
    FOR UPDATE TO authenticated
    USING (
        -- Apenas admins podem atualizar em caso de contingência
        EXISTS (
            SELECT 1 FROM usuarios u
            WHERE u.id = auth.uid()
            AND u.role = 'admin'
            AND NOT u.suspenso
        )
    );
```

## Funções de Validação
```sql
-- Função para validar horário da refeição
CREATE OR REPLACE FUNCTION validate_meal_time(
    p_tipo_refeicao_id UUID,
    p_horario TIME
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM tipos_refeicao tr
        WHERE tr.id = p_tipo_refeicao_id
        AND p_horario BETWEEN tr.hora_inicio AND tr.hora_fim + interval '15 minutes'
    );
END;
$$;

-- Função para validar limite diário
CREATE OR REPLACE FUNCTION validate_daily_limit(
    p_usuario_id UUID,
    p_tipo_refeicao_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_count INTEGER;
BEGIN
    SELECT COUNT(*)
    INTO v_count
    FROM uso_voucher
    WHERE usuario_id = p_usuario_id
    AND tipo_refeicao_id = p_tipo_refeicao_id
    AND DATE(usado_em) = CURRENT_DATE;

    RETURN v_count < 1;
END;
$$;

-- Função para validar intervalo entre refeições
CREATE OR REPLACE FUNCTION validate_meal_interval(
    p_usuario_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN NOT EXISTS (
        SELECT 1
        FROM uso_voucher
        WHERE usuario_id = p_usuario_id
        AND usado_em > NOW() - interval '3 hours'
    );
END;
$$;
```