-- Add new columns to vouchers_descartaveis table
ALTER TABLE vouchers_descartaveis
ADD COLUMN IF NOT EXISTS data_requisicao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN IF NOT EXISTS solicitante UUID REFERENCES admin_users(id);

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_vouchers_descartaveis_solicitante 
ON vouchers_descartaveis(solicitante);

-- Add comment for documentation
COMMENT ON COLUMN vouchers_descartaveis.data_requisicao IS 'Data e hora em que o voucher foi requisitado';
COMMENT ON COLUMN vouchers_descartaveis.solicitante IS 'ID do administrador que solicitou o voucher';