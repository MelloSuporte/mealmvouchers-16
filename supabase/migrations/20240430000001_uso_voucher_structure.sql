-- Drop existing indexes if they exist
DROP INDEX IF EXISTS idx_uso_voucher_extra_id;
DROP INDEX IF EXISTS idx_uso_voucher_data;
DROP INDEX IF EXISTS idx_uso_voucher_usuario;

-- Add missing columns if they don't exist
DO $$ 
BEGIN
    -- Add voucher_extra_id if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'uso_voucher' 
        AND column_name = 'voucher_extra_id'
    ) THEN
        ALTER TABLE uso_voucher 
        ADD COLUMN voucher_extra_id UUID REFERENCES vouchers_extras(id);
    END IF;

    -- Add observacao if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'uso_voucher' 
        AND column_name = 'observacao'
    ) THEN
        ALTER TABLE uso_voucher 
        ADD COLUMN observacao TEXT;
    END IF;

    -- Add created_at if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'uso_voucher' 
        AND column_name = 'created_at'
    ) THEN
        ALTER TABLE uso_voucher 
        ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
    END IF;
END $$;

-- Recreate indexes
CREATE INDEX IF NOT EXISTS idx_uso_voucher_extra_id ON uso_voucher(voucher_extra_id);
CREATE INDEX IF NOT EXISTS idx_uso_voucher_data ON uso_voucher(usado_em);
CREATE INDEX IF NOT EXISTS idx_uso_voucher_usuario ON uso_voucher(usuario_id);