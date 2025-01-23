-- Create vouchers_extras table
CREATE TABLE IF NOT EXISTS vouchers_extras (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID NOT NULL,
    tipo_refeicao_id UUID NOT NULL,
    autorizado_por VARCHAR(255) NOT NULL,
    codigo VARCHAR(8) NOT NULL,
    valido_ate DATE NOT NULL,
    usado_em TIMESTAMP WITH TIME ZONE,
    observacao TEXT,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    CONSTRAINT fk_tipo_refeicao FOREIGN KEY (tipo_refeicao_id) REFERENCES tipos_refeicao(id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_vouchers_extras_usuario ON vouchers_extras(usuario_id);
CREATE INDEX IF NOT EXISTS idx_vouchers_extras_tipo_refeicao ON vouchers_extras(tipo_refeicao_id);
CREATE INDEX IF NOT EXISTS idx_vouchers_extras_codigo ON vouchers_extras(codigo);
CREATE INDEX IF NOT EXISTS idx_vouchers_extras_valido_ate ON vouchers_extras(valido_ate);

-- Add helpful comments
COMMENT ON TABLE vouchers_extras IS 'Tabela para armazenar vouchers extras (sem RLS - validações no sistema)';

-- Grant basic permissions
GRANT ALL ON vouchers_extras TO authenticated;
GRANT ALL ON vouchers_extras TO anon;