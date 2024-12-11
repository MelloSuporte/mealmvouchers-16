-- Drop existing policies
DROP POLICY IF EXISTS "uso_voucher_insert_policy" ON uso_voucher;
DROP POLICY IF EXISTS "uso_voucher_select_policy" ON uso_voucher;

-- Enable RLS
ALTER TABLE uso_voucher ENABLE ROW LEVEL SECURITY;

-- Create unified insert policy without NEW reference
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

-- Create select policy
CREATE POLICY "uso_voucher_select_policy" ON uso_voucher AS PERMISSIVE
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM admin_users au
            WHERE au.id = auth.uid()
            AND (
                au.permissoes->>'gerenciar_usuarios' = 'true'
                OR au.permissoes->>'sistema' = 'true'
            )
            AND NOT au.suspenso
        )
    );

-- Add comments explaining the policies
COMMENT ON POLICY "uso_voucher_insert_policy" ON uso_voucher 
IS 'Permite inserção apenas pelo sistema, validando voucher comum ou extra';

COMMENT ON POLICY "uso_voucher_select_policy" ON uso_voucher 
IS 'Permite visualização apenas para administradores e sistema';

-- Recreate the validation function
DROP FUNCTION IF EXISTS validate_voucher_comum;

CREATE OR REPLACE FUNCTION validate_voucher_comum(
    p_voucher VARCHAR(4)
)
RETURNS TABLE (
    usuario_id UUID,
    nome VARCHAR,
    empresa_id UUID,
    turno_id UUID
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.id,
        u.nome,
        u.empresa_id,
        u.turno_id
    FROM usuarios u
    WHERE u.voucher = p_voucher
    AND NOT u.suspenso
    AND EXISTS (
        SELECT 1 FROM empresas e 
        WHERE e.id = u.empresa_id 
        AND e.ativo = true
    );

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Voucher inválido ou usuário suspenso';
    END IF;
END;
$$;

-- Add comment
COMMENT ON FUNCTION validate_voucher_comum IS 'Valida voucher comum pelo código de 4 dígitos';