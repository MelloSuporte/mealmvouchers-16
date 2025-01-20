-- Create vouchers_comuns table
CREATE TABLE IF NOT EXISTS vouchers_comuns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    codigo VARCHAR(4) NOT NULL UNIQUE,
    usuario_id UUID REFERENCES usuarios(id),
    tipo_refeicao_id UUID REFERENCES tipos_refeicao(id),
    turno_id UUID REFERENCES turnos(id),
    usado BOOLEAN DEFAULT FALSE,
    usado_em TIMESTAMP WITH TIME ZONE,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_vouchers_comuns_codigo ON vouchers_comuns(codigo);
CREATE INDEX IF NOT EXISTS idx_vouchers_comuns_usuario ON vouchers_comuns(usuario_id);
CREATE INDEX IF NOT EXISTS idx_vouchers_comuns_tipo_refeicao ON vouchers_comuns(tipo_refeicao_id);
CREATE INDEX IF NOT EXISTS idx_vouchers_comuns_turno ON vouchers_comuns(turno_id);

-- Enable RLS
ALTER TABLE vouchers_comuns ENABLE ROW LEVEL SECURITY;

-- Create validation function
CREATE OR REPLACE FUNCTION validate_and_use_voucher_comum(
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
    v_tipo_refeicao RECORD;
    v_uso_count INTEGER;
BEGIN
    -- Find user with valid voucher
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
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Voucher inválido ou usuário suspenso'
        );
    END IF;

    -- Get meal type information
    SELECT * INTO v_tipo_refeicao
    FROM tipos_refeicao
    WHERE id = p_tipo_refeicao_id
    AND ativo = true;

    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Tipo de refeição inválido ou inativo'
        );
    END IF;

    -- Validate meal time
    IF NOT (
        CURRENT_TIME BETWEEN v_tipo_refeicao.horario_inicio 
        AND (v_tipo_refeicao.horario_fim + (v_tipo_refeicao.minutos_tolerancia || ' minutes')::INTERVAL)
    ) THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', format('Esta refeição só pode ser utilizada entre %s e %s',
                v_tipo_refeicao.horario_inicio::TEXT,
                v_tipo_refeicao.horario_fim::TEXT
            )
        );
    END IF;

    -- Check daily usage limit
    SELECT COUNT(*)
    INTO v_uso_count
    FROM uso_voucher
    WHERE usuario_id = v_usuario_id
    AND DATE(usado_em) = CURRENT_DATE;

    IF v_uso_count >= 2 THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Limite diário de refeições atingido'
        );
    END IF;

    -- Register usage
    INSERT INTO uso_voucher (
        usuario_id,
        tipo_refeicao_id,
        tipo_voucher,
        usado_em
    ) VALUES (
        v_usuario_id,
        p_tipo_refeicao_id,
        'comum',
        CURRENT_TIMESTAMP
    );

    RETURN jsonb_build_object(
        'success', true,
        'message', 'Voucher validado com sucesso',
        'usuario_id', v_usuario_id
    );

EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', SQLERRM
        );
END;
$$;

-- Create RLS Policies
CREATE POLICY "vouchers_comuns_select_policy" ON vouchers_comuns
    FOR SELECT TO authenticated, anon
    USING (
        NOT usado 
        AND EXISTS (
            SELECT 1 FROM tipos_refeicao tr
            WHERE tr.id = tipo_refeicao_id
            AND tr.ativo = true
            AND CURRENT_TIME BETWEEN tr.horario_inicio 
            AND (tr.horario_fim + (tr.minutos_tolerancia || ' minutes')::INTERVAL)
        )
        AND EXISTS (
            SELECT 1 FROM turnos t
            WHERE t.id = turno_id
            AND t.ativo = true
        )
    );

CREATE POLICY "vouchers_comuns_insert_policy" ON vouchers_comuns
    FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM usuarios u
            WHERE u.id = auth.uid()
            AND u.role = 'system'
        )
    );

CREATE POLICY "vouchers_comuns_update_policy" ON vouchers_comuns
    FOR UPDATE TO authenticated, anon
    USING (
        NOT usado
        AND EXISTS (
            SELECT 1 FROM tipos_refeicao tr
            WHERE tr.id = tipo_refeicao_id
            AND tr.ativo = true
            AND CURRENT_TIME BETWEEN tr.horario_inicio 
            AND (tr.horario_fim + (tr.minutos_tolerancia || ' minutes')::INTERVAL)
        )
    )
    WITH CHECK (
        usado = true
        AND usado_em IS NOT NULL
    );

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE ON vouchers_comuns TO authenticated;
GRANT SELECT, UPDATE ON vouchers_comuns TO anon;

-- Add helpful comments
COMMENT ON TABLE vouchers_comuns IS 'Tabela para armazenar vouchers comuns com validação de horário e turno';
COMMENT ON FUNCTION validate_and_use_voucher_comum IS 'Função para validar e registrar uso de voucher comum com todas as regras de negócio';