-- Add detailed comments for policies and validation rules
COMMENT ON TABLE uso_voucher IS 'Registros de uso de vouchers (comum e extra)';
COMMENT ON COLUMN uso_voucher.voucher_extra_id IS 'Referência ao voucher extra quando aplicável';
COMMENT ON COLUMN uso_voucher.observacao IS 'Observações adicionais sobre o uso do voucher';
COMMENT ON COLUMN uso_voucher.usuario_id IS 'ID do usuário que utilizou o voucher';
COMMENT ON COLUMN uso_voucher.tipo_refeicao_id IS 'Tipo de refeição utilizada';
COMMENT ON COLUMN uso_voucher.usado_em IS 'Data e hora de uso do voucher';