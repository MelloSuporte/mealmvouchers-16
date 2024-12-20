-- Drop existing policies
DROP POLICY IF EXISTS "vouchers_extras_select_policy" ON vouchers_extras;
DROP POLICY IF EXISTS "vouchers_extras_update_policy" ON vouchers_extras;

-- Ensure usado_em column exists with correct type
DO $$ 
BEGIN
    -- Drop usado column if it exists
    IF EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'vouchers_extras' 
        AND column_name = 'usado'
    ) THEN
        ALTER TABLE vouchers_extras DROP COLUMN usado;
    END IF;

    -- Add usado_em column if it doesn't exist
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'vouchers_extras' 
        AND column_name = 'usado_em'
    ) THEN
        ALTER TABLE vouchers_extras ADD COLUMN usado_em TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

-- Create new policies using usado_em
CREATE POLICY "vouchers_extras_select_policy" ON vouchers_extras
    FOR SELECT TO authenticated
    USING (
        usuario_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM usuarios u
            WHERE u.id = auth.uid()
            AND u.role IN ('admin', 'gestor')
            AND NOT u.suspenso
        )
    );

CREATE POLICY "vouchers_extras_update_policy" ON vouchers_extras AS PERMISSIVE
    FOR UPDATE TO authenticated
    USING (
        usuario_id = auth.uid()
        AND usado_em IS NULL
        AND CURRENT_DATE <= valido_ate
    )
    WITH CHECK (
        EXISTS (
            SELECT 1
            FROM vouchers_extras
            WHERE id = vouchers_extras.id
            AND usuario_id = auth.uid()
            AND tipo_refeicao_id = vouchers_extras.tipo_refeicao_id
            AND valido_ate = vouchers_extras.valido_ate
            AND usado_em IS NULL
        )
    );

-- Add helpful comments
COMMENT ON COLUMN vouchers_extras.usado_em IS 'Data e hora em que o voucher foi utilizado';