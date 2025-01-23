-- Drop existing table if it exists
DROP TABLE IF EXISTS vouchers_extras CASCADE;

-- Create vouchers_extras table
CREATE TABLE vouchers_extras (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID REFERENCES usuarios(id),
    tipo_refeicao_id UUID REFERENCES tipos_refeicao(id),
    autorizado_por VARCHAR(255) NOT NULL,
    codigo VARCHAR(8) NOT NULL,
    valido_ate DATE NOT NULL,
    usado_em TIMESTAMP WITH TIME ZONE,
    observacao TEXT,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_vouchers_extras_usuario ON vouchers_extras(usuario_id);
CREATE INDEX idx_vouchers_extras_tipo_refeicao ON vouchers_extras(tipo_refeicao_id);
CREATE INDEX idx_vouchers_extras_codigo ON vouchers_extras(codigo);
CREATE INDEX idx_vouchers_extras_valido_ate ON vouchers_extras(valido_ate);

-- Grant necessary permissions without RLS
GRANT ALL ON vouchers_extras TO authenticated;
GRANT ALL ON vouchers_extras TO anon;
GRANT ALL ON vouchers_extras TO service_role;

-- Add helpful comments
COMMENT ON TABLE vouchers_extras IS 'Tabela para armazenar vouchers extras sem RLS - validações feitas na aplicação';
COMMENT ON COLUMN vouchers_extras.id IS 'Identificador único do voucher extra';
COMMENT ON COLUMN vouchers_extras.usuario_id IS 'ID do usuário associado ao voucher';
COMMENT ON COLUMN vouchers_extras.tipo_refeicao_id IS 'ID do tipo de refeição';
COMMENT ON COLUMN vouchers_extras.autorizado_por IS 'Quem autorizou o voucher extra';
COMMENT ON COLUMN vouchers_extras.codigo IS 'Código do voucher';
COMMENT ON COLUMN vouchers_extras.valido_ate IS 'Data de validade do voucher';
COMMENT ON COLUMN vouchers_extras.usado_em IS 'Data e hora em que o voucher foi utilizado';
COMMENT ON COLUMN vouchers_extras.observacao IS 'Observações sobre o voucher';
COMMENT ON COLUMN vouchers_extras.criado_em IS 'Data e hora de criação do registro';
COMMENT ON COLUMN vouchers_extras.atualizado_em IS 'Data e hora da última atualização';

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.atualizado_em = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_vouchers_extras_updated_at
    BEFORE UPDATE ON vouchers_extras
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();