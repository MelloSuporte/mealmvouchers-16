-- Grant necessary permissions
GRANT SELECT, UPDATE ON vouchers_descartaveis TO authenticated;
GRANT USAGE ON SEQUENCE vouchers_descartaveis_id_seq TO authenticated;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_vouchers_descartaveis_codigo ON vouchers_descartaveis(codigo);
CREATE INDEX IF NOT EXISTS idx_vouchers_descartaveis_tipo_refeicao ON vouchers_descartaveis(tipo_refeicao_id);
CREATE INDEX IF NOT EXISTS idx_vouchers_descartaveis_usado ON vouchers_descartaveis(usado);