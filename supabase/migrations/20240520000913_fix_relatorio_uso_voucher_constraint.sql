-- Adiciona constraint única para evitar duplicatas
ALTER TABLE relatorio_uso_voucher 
ADD CONSTRAINT relatorio_uso_voucher_unique_key 
UNIQUE (data_uso, usuario_id, tipo_refeicao);

-- Adiciona índice para melhorar performance da sincronização
CREATE INDEX IF NOT EXISTS idx_relatorio_uso_voucher_sync 
ON relatorio_uso_voucher (data_uso, usuario_id, tipo_refeicao);

-- Atualiza comentário da tabela
COMMENT ON TABLE relatorio_uso_voucher IS 
'Tabela desnormalizada para relatórios de uso de vouchers, sincronizada com vw_uso_voucher_detalhado';