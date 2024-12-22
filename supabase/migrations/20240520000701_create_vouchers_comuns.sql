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

-- Create index for better performance
CREATE INDEX idx_vouchers_comuns_codigo ON vouchers_comuns(codigo);
CREATE INDEX idx_vouchers_comuns_usuario ON vouchers_comuns(usuario_id);

-- Enable RLS
ALTER TABLE vouchers_comuns ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "voucher_comum_select_policy" ON vouchers_comuns;
DROP POLICY IF EXISTS "voucher_comum_insert_policy" ON vouchers_comuns;
DROP POLICY IF EXISTS "voucher_comum_update_policy" ON vouchers_comuns;

-- Select policy with meal type and shift validation
CREATE POLICY "voucher_comum_select_policy" ON vouchers_comuns
    FOR SELECT TO authenticated, anon
    USING (
        EXISTS (
            SELECT 1 FROM tipos_refeicao tr
            WHERE tr.id = tipo_refeicao_id
            AND tr.ativo = true
            AND CURRENT_TIME BETWEEN tr.horario_inicio 
            AND (tr.horario_fim + (tr.minutos_tolerancia || ' minutes')::INTERVAL)
        )
        AND
        EXISTS (
            SELECT 1 FROM turnos t
            WHERE t.id = turno_id
            AND t.ativo = true
            AND CURRENT_TIME BETWEEN t.horario_inicio AND t.horario_fim
        )
    );

-- Insert policy for system only
CREATE POLICY "voucher_comum_insert_policy" ON vouchers_comuns
    FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM admin_users au
            WHERE au.id = auth.uid()
            AND au.permissoes->>'sistema' = 'true'
        )
        AND
        EXISTS (
            SELECT 1 FROM tipos_refeicao tr
            WHERE tr.id = tipo_refeicao_id
            AND tr.ativo = true
        )
        AND
        EXISTS (
            SELECT 1 FROM turnos t
            WHERE t.id = turno_id
            AND t.ativo = true
        )
    );

-- Update policy for system and admins
CREATE POLICY "voucher_comum_update_policy" ON vouchers_comuns
    FOR UPDATE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM admin_users au
            WHERE au.id = auth.uid()
            AND (
                au.permissoes->>'sistema' = 'true'
                OR au.permissoes->>'gerenciar_vouchers' = 'true'
            )
            AND NOT au.suspenso
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM tipos_refeicao tr
            WHERE tr.id = tipo_refeicao_id
            AND tr.ativo = true
        )
        AND
        EXISTS (
            SELECT 1 FROM turnos t
            WHERE t.id = turno_id
            AND t.ativo = true
        )
    );

-- Add helpful comments
COMMENT ON TABLE vouchers_comuns IS 'Tabela para armazenar vouchers comuns dos usuários';
COMMENT ON COLUMN vouchers_comuns.codigo IS 'Código único de 4 dígitos do voucher';
COMMENT ON COLUMN vouchers_comuns.usado IS 'Indica se o voucher já foi utilizado';
COMMENT ON COLUMN vouchers_comuns.usado_em IS 'Data e hora em que o voucher foi utilizado';

COMMENT ON POLICY "voucher_comum_select_policy" ON vouchers_comuns IS 
'Permite visualizar vouchers comuns apenas dentro do horário permitido do turno e tipo de refeição';

COMMENT ON POLICY "voucher_comum_insert_policy" ON vouchers_comuns IS
'Permite apenas o sistema criar vouchers comuns com validação de turno e tipo de refeição';

COMMENT ON POLICY "voucher_comum_update_policy" ON vouchers_comuns IS
'Permite sistema e admins atualizarem vouchers comuns com validação de turno e tipo de refeição';

-- Create trigger to update atualizado_em
CREATE OR REPLACE FUNCTION update_voucher_comum_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.atualizado_em = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_vouchers_comuns_timestamp
    BEFORE UPDATE ON vouchers_comuns
    FOR EACH ROW
    EXECUTE FUNCTION update_voucher_comum_updated_at();