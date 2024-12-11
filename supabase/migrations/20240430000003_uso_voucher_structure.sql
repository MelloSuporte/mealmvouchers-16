-- Add necessary columns and indexes to uso_voucher table
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