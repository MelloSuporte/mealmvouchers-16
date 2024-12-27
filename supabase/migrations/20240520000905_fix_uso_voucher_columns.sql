-- Adicionar colunas necessárias se não existirem
DO $$ 
BEGIN
    -- Adicionar coluna tipo_voucher se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'uso_voucher' 
        AND column_name = 'tipo_voucher'
    ) THEN
        ALTER TABLE uso_voucher 
        ADD COLUMN tipo_voucher VARCHAR(20) CHECK (tipo_voucher IN ('comum', 'extra', 'descartavel'));
    END IF;

    -- Adicionar coluna voucher_extra_id se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'uso_voucher' 
        AND column_name = 'voucher_extra_id'
    ) THEN
        ALTER TABLE uso_voucher 
        ADD COLUMN voucher_extra_id UUID REFERENCES vouchers_extras(id);
    END IF;

    -- Adicionar coluna voucher_descartavel_id se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'uso_voucher' 
        AND column_name = 'voucher_descartavel_id'
    ) THEN
        ALTER TABLE uso_voucher 
        ADD COLUMN voucher_descartavel_id UUID REFERENCES vouchers_descartaveis(id);
    END IF;
END $$;

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_uso_voucher_tipo ON uso_voucher(tipo_voucher);
CREATE INDEX IF NOT EXISTS idx_uso_voucher_extra_id ON uso_voucher(voucher_extra_id);
CREATE INDEX IF NOT EXISTS idx_uso_voucher_descartavel_id ON uso_voucher(voucher_descartavel_id);