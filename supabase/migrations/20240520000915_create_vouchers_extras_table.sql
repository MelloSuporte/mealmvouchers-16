-- Create vouchers_extras table if it doesn't exist
CREATE TABLE IF NOT EXISTS vouchers_extras (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID REFERENCES usuarios(id),
    tipo_refeicao_id UUID REFERENCES tipos_refeicao(id),
    codigo VARCHAR(8) NOT NULL UNIQUE,
    valido_ate DATE NOT NULL,
    usado_em TIMESTAMP WITH TIME ZONE,
    observacao TEXT,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    CONSTRAINT fk_tipo_refeicao FOREIGN KEY (tipo_refeicao_id) REFERENCES tipos_refeicao(id) ON DELETE CASCADE
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_vouchers_extras_usuario ON vouchers_extras(usuario_id);
CREATE INDEX IF NOT EXISTS idx_vouchers_extras_tipo_refeicao ON vouchers_extras(tipo_refeicao_id);
CREATE INDEX IF NOT EXISTS idx_vouchers_extras_codigo ON vouchers_extras(codigo);
CREATE INDEX IF NOT EXISTS idx_vouchers_extras_valido_ate ON vouchers_extras(valido_ate);

-- Add RLS policies
ALTER TABLE vouchers_extras ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "vouchers_extras_select_policy" ON vouchers_extras
    FOR SELECT TO authenticated
    USING (true);

CREATE POLICY "vouchers_extras_insert_policy" ON vouchers_extras
    FOR INSERT TO authenticated
    WITH CHECK (true);

CREATE POLICY "vouchers_extras_update_policy" ON vouchers_extras
    FOR UPDATE TO authenticated
    USING (true)
    WITH CHECK (true);

-- Grant permissions
GRANT ALL ON vouchers_extras TO authenticated;
GRANT ALL ON vouchers_extras TO service_role;

-- Add helpful comments
COMMENT ON TABLE vouchers_extras IS 'Tabela para armazenar vouchers extras';
COMMENT ON COLUMN vouchers_extras.id IS 'Identificador único do voucher extra';
COMMENT ON COLUMN vouchers_extras.usuario_id IS 'ID do usuário associado ao voucher';
COMMENT ON COLUMN vouchers_extras.tipo_refeicao_id IS 'ID do tipo de refeição';
COMMENT ON COLUMN vouchers_extras.codigo IS 'Código único do voucher extra';
COMMENT ON COLUMN vouchers_extras.valido_ate IS 'Data de validade do voucher';
COMMENT ON COLUMN vouchers_extras.usado_em IS 'Data e hora em que o voucher foi utilizado';
COMMENT ON COLUMN vouchers_extras.observacao IS 'Observações sobre o voucher';
COMMENT ON COLUMN vouchers_extras.criado_em IS 'Data e hora de criação do registro';