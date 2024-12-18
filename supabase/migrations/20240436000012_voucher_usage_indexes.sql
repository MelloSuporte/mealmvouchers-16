-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_uso_voucher_usuario ON uso_voucher(usuario_id);
CREATE INDEX IF NOT EXISTS idx_uso_voucher_tipo_refeicao ON uso_voucher(tipo_refeicao_id);
CREATE INDEX IF NOT EXISTS idx_uso_voucher_data ON uso_voucher(usado_em);

-- Add comments
COMMENT ON INDEX idx_uso_voucher_usuario IS 'Índice para busca por usuário';
COMMENT ON INDEX idx_uso_voucher_tipo_refeicao IS 'Índice para busca por tipo de refeição';
COMMENT ON INDEX idx_uso_voucher_data IS 'Índice para busca por data de uso';