-- Add missing columns
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'vouchers_extras' 
                  AND column_name = 'criado_por') THEN
        ALTER TABLE vouchers_extras 
        ADD COLUMN criado_por UUID REFERENCES auth.users(id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'vouchers_extras' 
                  AND column_name = 'criado_em') THEN
        ALTER TABLE vouchers_extras 
        ADD COLUMN criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'vouchers_extras' 
                  AND column_name = 'atualizado_em') THEN
        ALTER TABLE vouchers_extras 
        ADD COLUMN atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
    END IF;
END $$;

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_vouchers_extras_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.atualizado_em = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_vouchers_extras_updated_at_trigger ON vouchers_extras;

CREATE TRIGGER update_vouchers_extras_updated_at_trigger
    BEFORE UPDATE ON vouchers_extras
    FOR EACH ROW
    EXECUTE FUNCTION update_vouchers_extras_updated_at();