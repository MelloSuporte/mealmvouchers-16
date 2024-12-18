-- Add indexes to improve voucher validation performance
CREATE INDEX IF NOT EXISTS idx_vouchers_descartaveis_codigo_tipo ON vouchers_descartaveis(codigo, tipo_refeicao_id);
CREATE INDEX IF NOT EXISTS idx_vouchers_descartaveis_usado ON vouchers_descartaveis(usado) WHERE NOT usado;
CREATE INDEX IF NOT EXISTS idx_usuarios_voucher ON usuarios(voucher) WHERE NOT suspenso;
CREATE INDEX IF NOT EXISTS idx_uso_voucher_usuario_data ON uso_voucher(usuario_id, usado_em);