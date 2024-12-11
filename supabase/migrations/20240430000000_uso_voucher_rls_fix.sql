-- Drop existing policies
DROP POLICY IF EXISTS "uso_voucher_insert_policy" ON uso_voucher;
DROP POLICY IF EXISTS "uso_voucher_select_policy" ON uso_voucher;

-- Enable RLS
ALTER TABLE uso_voucher ENABLE ROW LEVEL SECURITY;

-- Create unified insert policy with proper NEW reference
CREATE POLICY "uso_voucher_insert_policy" ON uso_voucher AS PERMISSIVE
    FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM admin_users au
            WHERE au.id = auth.uid()
            AND au.permissoes->>'sistema' = 'true'
        )
        AND
        CASE 
            WHEN voucher_extra_id IS NOT NULL THEN
                check_voucher_extra_rules(
                    voucher_extra_id, 
                    usuario_id, 
                    tipo_refeicao_id,
                    (SELECT voucher FROM usuarios WHERE id = usuario_id)
                )
            ELSE
                check_voucher_comum_rules(
                    usuario_id, 
                    tipo_refeicao_id,
                    (SELECT voucher FROM usuarios WHERE id = usuario_id)
                )
        END
    );

-- Create select policy
CREATE POLICY "uso_voucher_select_policy" ON uso_voucher AS PERMISSIVE
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
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'uso_voucher' 
                  AND column_name = 'voucher_extra_id') THEN
        ALTER TABLE uso_voucher 
        ADD COLUMN voucher_extra_id UUID REFERENCES vouchers_extras(id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'uso_voucher' 
                  AND column_name = 'observacao') THEN
        ALTER TABLE uso_voucher 
        ADD COLUMN observacao TEXT;
    END IF;
END $$;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_uso_voucher_extra_id ON uso_voucher(voucher_extra_id);
CREATE INDEX IF NOT EXISTS idx_uso_voucher_data ON uso_voucher(usado_em);
CREATE INDEX IF NOT EXISTS idx_uso_voucher_usuario ON uso_voucher(usuario_id);

-- Add comments
COMMENT ON POLICY "uso_voucher_insert_policy" ON uso_voucher IS 'Controla inserção de registros de uso de vouchers (comum e extra) com validações específicas';
COMMENT ON POLICY "uso_voucher_select_policy" ON uso_voucher IS 'Controla visualização do histórico de uso de vouchers';