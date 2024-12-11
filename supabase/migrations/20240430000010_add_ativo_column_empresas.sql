-- Add ativo column to empresas table
ALTER TABLE empresas 
ADD COLUMN IF NOT EXISTS ativo BOOLEAN DEFAULT true;

-- Update existing rows to have ativo = true
UPDATE empresas SET ativo = true WHERE ativo IS NULL;

-- Add comment explaining the column
COMMENT ON COLUMN empresas.ativo IS 'Indica se a empresa está ativa no sistema';

-- Update the RLS policies to use the new column
DROP POLICY IF EXISTS "uso_voucher_insert_policy" ON uso_voucher;

CREATE POLICY "uso_voucher_insert_policy" ON uso_voucher AS PERMISSIVE
    FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM admin_users au
            WHERE au.id = auth.uid()
            AND au.permissoes->>'sistema' = 'true'
        )
        AND
        (
            -- Validação para voucher extra
            (
                voucher_extra_id IS NOT NULL
                AND EXISTS (
                    SELECT 1 FROM vouchers_extras ve
                    WHERE ve.id = voucher_extra_id
                    AND NOT ve.usado
                )
            )
            OR
            -- Validação para voucher comum
            (
                voucher_extra_id IS NULL
                AND EXISTS (
                    SELECT 1 FROM usuarios u
                    WHERE u.id = usuario_id
                    AND NOT u.suspenso
                    AND EXISTS (
                        SELECT 1 FROM empresas e
                        WHERE e.id = u.empresa_id
                        AND e.ativo = true
                    )
                )
            )
        )
    );