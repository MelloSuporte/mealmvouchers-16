-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_vouchers_descartaveis_codigo 
    ON vouchers_descartaveis(codigo);

CREATE INDEX IF NOT EXISTS idx_vouchers_descartaveis_tipo_refeicao 
    ON vouchers_descartaveis(tipo_refeicao_id);

CREATE INDEX IF NOT EXISTS idx_vouchers_descartaveis_usado 
    ON vouchers_descartaveis(usado);

CREATE INDEX IF NOT EXISTS idx_vouchers_descartaveis_data_expiracao 
    ON vouchers_descartaveis(data_expiracao);