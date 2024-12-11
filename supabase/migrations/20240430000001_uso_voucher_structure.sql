-- Create or modify uso_voucher table
CREATE TABLE IF NOT EXISTS uso_voucher (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID NOT NULL REFERENCES usuarios(id),
    tipo_refeicao_id UUID NOT NULL REFERENCES tipos_refeicao(id),
    voucher_extra_id UUID REFERENCES vouchers_extras(id),
    observacao TEXT,
    usado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_uso_voucher_extra_id ON uso_voucher(voucher_extra_id);
CREATE INDEX IF NOT EXISTS idx_uso_voucher_data ON uso_voucher(usado_em);
CREATE INDEX IF NOT EXISTS idx_uso_voucher_usuario ON uso_voucher(usuario_id);