-- Drop existing policies
DROP POLICY IF EXISTS "uso_voucher_insert_policy" ON uso_voucher;
DROP POLICY IF EXISTS "uso_voucher_select_policy" ON uso_voucher;

-- Enable RLS
ALTER TABLE uso_voucher ENABLE ROW LEVEL SECURITY;

-- Create unified insert policy with proper data type handling
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
                    JOIN empresas e ON e.id = u.empresa_id
                    WHERE u.id::text = usuario_id::text
                    AND NOT u.suspenso
                    AND e.ativo = true
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

-- Update validation function to handle string IDs
DROP FUNCTION IF EXISTS validate_voucher_comum;

CREATE OR REPLACE FUNCTION validate_voucher_comum(
    p_voucher VARCHAR(4)
)
RETURNS TABLE (
    usuario_id TEXT,
    nome VARCHAR,
    empresa_id TEXT,
    turno_id TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.id::text,
        u.nome,
        u.empresa_id::text,
        u.turno_id::text
    FROM usuarios u
    JOIN empresas e ON e.id = u.empresa_id
    WHERE u.voucher = p_voucher
    AND NOT u.suspenso
    AND e.ativo = true;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Voucher inválido ou usuário suspenso';
    END IF;
END;
$$;

-- Add comments
COMMENT ON POLICY "uso_voucher_insert_policy" ON uso_voucher 
IS 'Permite inserção apenas pelo sistema, validando voucher comum ou extra com tratamento adequado de tipos';

COMMENT ON POLICY "uso_voucher_select_policy" ON uso_voucher 
IS 'Permite visualização apenas para administradores e sistema';

COMMENT ON FUNCTION validate_voucher_comum IS 'Valida voucher comum pelo código de 4 dígitos com tratamento adequado de tipos';