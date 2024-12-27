-- Adicionar novas colunas na tabela uso_voucher
ALTER TABLE uso_voucher 
ADD COLUMN IF NOT EXISTS tipo_voucher VARCHAR(20) CHECK (tipo_voucher IN ('comum', 'extra', 'descartavel')),
ADD COLUMN IF NOT EXISTS voucher_extra_id UUID REFERENCES vouchers_extras(id),
ADD COLUMN IF NOT EXISTS voucher_descartavel_id UUID REFERENCES vouchers_descartaveis(id);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_uso_voucher_tipo ON uso_voucher(tipo_voucher);
CREATE INDEX IF NOT EXISTS idx_uso_voucher_extra_id ON uso_voucher(voucher_extra_id);
CREATE INDEX IF NOT EXISTS idx_uso_voucher_descartavel_id ON uso_voucher(voucher_descartavel_id);

-- Atualizar a política RLS para permitir inserção de todos os tipos de voucher
DROP POLICY IF EXISTS "uso_voucher_insert_policy" ON uso_voucher;

CREATE POLICY "uso_voucher_insert_policy" ON uso_voucher
    FOR INSERT TO authenticated
    WITH CHECK (
        -- Validar voucher comum
        (tipo_voucher = 'comum' AND EXISTS (
            SELECT 1 FROM usuarios u
            WHERE u.id = usuario_id
            AND NOT u.suspenso
            AND EXISTS (
                SELECT 1 FROM empresas e
                WHERE e.id = u.empresa_id
                AND e.ativo = true
            )
        ))
        OR
        -- Validar voucher extra
        (tipo_voucher = 'extra' AND EXISTS (
            SELECT 1 FROM vouchers_extras ve
            WHERE ve.id = voucher_extra_id
            AND ve.usado_em IS NULL
        ))
        OR
        -- Validar voucher descartável
        (tipo_voucher = 'descartavel' AND EXISTS (
            SELECT 1 FROM vouchers_descartaveis vd
            WHERE vd.id = voucher_descartavel_id
            AND vd.usado_em IS NULL
        ))
    );

COMMENT ON POLICY "uso_voucher_insert_policy" ON uso_voucher 
IS 'Controla inserção de registros de uso de vouchers com validação por tipo';