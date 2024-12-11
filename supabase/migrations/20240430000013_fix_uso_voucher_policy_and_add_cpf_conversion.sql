-- Drop existing policies
DROP POLICY IF EXISTS "uso_voucher_insert_policy" ON uso_voucher;
DROP POLICY IF EXISTS "uso_voucher_select_policy" ON uso_voucher;

-- Create UUID extension if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create CPF to UUID conversion function
CREATE OR REPLACE FUNCTION convert_cpf_to_uuid(cpf TEXT) 
RETURNS UUID AS $$
BEGIN
    RETURN uuid_generate_v5(
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,
        cpf
    );
END;
$$ LANGUAGE plpgsql;

-- Create unified insert policy with CPF conversion
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
            -- Validação para voucher comum usando conversão de CPF
            (
                voucher_extra_id IS NULL
                AND EXISTS (
                    SELECT 1 FROM usuarios u
                    JOIN empresas e ON e.id = u.empresa_id
                    WHERE convert_cpf_to_uuid(u.cpf) = usuario_id
                    AND NOT u.suspenso
                    AND e.ativo = true
                )
            )
        )
    );

-- Recreate select policy
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

-- Add comments
COMMENT ON FUNCTION convert_cpf_to_uuid IS 'Converte CPF para UUID v5 usando namespace fixo';
COMMENT ON POLICY "uso_voucher_insert_policy" ON uso_voucher IS 'Permite inserção apenas pelo sistema, validando voucher comum (com conversão de CPF) ou extra';
COMMENT ON POLICY "uso_voucher_select_policy" ON uso_voucher IS 'Permite visualização apenas para administradores e sistema';