-- Drop existing policies
DROP POLICY IF EXISTS "uso_voucher_comum_insert_policy" ON uso_voucher;
DROP POLICY IF EXISTS "uso_voucher_comum_select_policy" ON uso_voucher;

-- Create new unified policies
CREATE POLICY "uso_voucher_insert_policy" ON uso_voucher
    FOR INSERT TO authenticated
    WITH CHECK (
        -- Verificar se é sistema
        EXISTS (
            SELECT 1 FROM admin_users au
            WHERE au.id = auth.uid()
            AND au.permissoes->>'sistema' = 'true'
        )
        AND
        -- Aplicar regras específicas baseado no tipo de voucher
        CASE 
            WHEN NEW.voucher_extra_id IS NOT NULL THEN
                check_voucher_extra_rules(NEW.voucher_extra_id, NEW.usuario_id, NEW.tipo_refeicao_id)
            ELSE
                check_voucher_comum_rules(NEW.usuario_id, NEW.tipo_refeicao_id)
        END
    );

CREATE POLICY "uso_voucher_select_policy" ON uso_voucher
    FOR SELECT TO authenticated
    USING (
        usuario_id = auth.uid()
        OR
        EXISTS (
            SELECT 1 FROM admin_users au
            WHERE au.id = auth.uid()
            AND au.permissoes->>'gerenciar_usuarios' = 'true'
            AND NOT au.suspenso
        )
    );

-- Add necessary columns if they don't exist
ALTER TABLE uso_voucher 
    ADD COLUMN IF NOT EXISTS voucher_extra_id UUID REFERENCES vouchers_extras(id),
    ADD COLUMN IF NOT EXISTS observacao TEXT;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_uso_voucher_extra_id ON uso_voucher(voucher_extra_id);
CREATE INDEX IF NOT EXISTS idx_uso_voucher_data ON uso_voucher(usado_em);

-- Add comments
COMMENT ON POLICY "uso_voucher_insert_policy" ON uso_voucher IS 'Controla inserção de registros de uso de vouchers (comum e extra) com validações específicas';
COMMENT ON POLICY "uso_voucher_select_policy" ON uso_voucher IS 'Controla visualização do histórico de uso de vouchers';