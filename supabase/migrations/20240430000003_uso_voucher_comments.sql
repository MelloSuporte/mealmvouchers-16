-- Add detailed comments for table and columns
COMMENT ON TABLE uso_voucher IS 'Registros de uso de vouchers (comum e extra)';
COMMENT ON COLUMN uso_voucher.id IS 'Identificador único do registro de uso do voucher';
COMMENT ON COLUMN uso_voucher.usuario_id IS 'ID do usuário que utilizou o voucher';
COMMENT ON COLUMN uso_voucher.tipo_refeicao_id IS 'Tipo de refeição utilizada';
COMMENT ON COLUMN uso_voucher.voucher_extra_id IS 'Referência ao voucher extra quando aplicável';
COMMENT ON COLUMN uso_voucher.observacao IS 'Observações adicionais sobre o uso do voucher';
COMMENT ON COLUMN uso_voucher.usado_em IS 'Data e hora de uso do voucher';
COMMENT ON COLUMN uso_voucher.created_at IS 'Data e hora de criação do registro';

-- Add comments for policies
COMMENT ON POLICY "uso_voucher_insert_policy" ON uso_voucher IS 'Controla inserção de registros de uso de vouchers (comum e extra) com validações específicas';
COMMENT ON POLICY "uso_voucher_select_policy" ON uso_voucher IS 'Controla visualização do histórico de uso de vouchers';