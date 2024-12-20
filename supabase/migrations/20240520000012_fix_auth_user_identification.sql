-- Drop existing view
DROP VIEW IF EXISTS vw_uso_voucher_detalhado;

-- Recreate view with SECURITY INVOKER and auth.uid() check
CREATE VIEW vw_uso_voucher_detalhado
WITH (security_barrier = true, security_invoker = true)
AS
SELECT 
    uv.id,
    uv.usado_em as data_uso,
    u.id as usuario_id,
    u.nome as nome_usuario,
    u.cpf,
    e.id as empresa_id,
    e.nome as nome_empresa,
    t.tipo_turno as turno,
    s.id as setor_id,
    s.nome_setor,
    tr.nome as tipo_refeicao,
    tr.valor as valor_refeicao,
    uv.observacao,
    auth.uid() as authenticated_user
FROM uso_voucher uv
LEFT JOIN usuarios u ON uv.usuario_id = u.id
LEFT JOIN empresas e ON u.empresa_id = e.id
LEFT JOIN turnos t ON u.turno_id = t.id
LEFT JOIN setores s ON u.setor_id = s.id
LEFT JOIN tipos_refeicao tr ON uv.tipo_refeicao_id = tr.id;

-- Set permissions
ALTER VIEW vw_uso_voucher_detalhado OWNER TO postgres;
GRANT ALL ON vw_uso_voucher_detalhado TO authenticated;

-- Drop existing policies
DROP POLICY IF EXISTS "uso_voucher_select_policy" ON uso_voucher;
DROP POLICY IF EXISTS "uso_voucher_insert_policy" ON uso_voucher;
DROP POLICY IF EXISTS "uso_voucher_update_policy" ON uso_voucher;
DROP POLICY IF EXISTS "uso_voucher_delete_policy" ON uso_voucher;

-- Enable RLS
ALTER TABLE uso_voucher ENABLE ROW LEVEL SECURITY;

-- Create new policies with auth.uid() check
CREATE POLICY "uso_voucher_select_policy" ON uso_voucher
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM usuarios u 
            WHERE u.id = usuario_id 
            AND u.auth_id = auth.uid()
        ) OR 
        EXISTS (
            SELECT 1 FROM admin_users au 
            WHERE au.auth_id = auth.uid()
        )
    );

CREATE POLICY "uso_voucher_insert_policy" ON uso_voucher
    FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM usuarios u 
            WHERE u.id = usuario_id 
            AND u.auth_id = auth.uid()
        ) OR 
        EXISTS (
            SELECT 1 FROM admin_users au 
            WHERE au.auth_id = auth.uid()
        )
    );

CREATE POLICY "uso_voucher_update_policy" ON uso_voucher
    FOR UPDATE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM usuarios u 
            WHERE u.id = usuario_id 
            AND u.auth_id = auth.uid()
        ) OR 
        EXISTS (
            SELECT 1 FROM admin_users au 
            WHERE au.auth_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM usuarios u 
            WHERE u.id = usuario_id 
            AND u.auth_id = auth.uid()
        ) OR 
        EXISTS (
            SELECT 1 FROM admin_users au 
            WHERE au.auth_id = auth.uid()
        )
    );

CREATE POLICY "uso_voucher_delete_policy" ON uso_voucher
    FOR DELETE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM usuarios u 
            WHERE u.id = usuario_id 
            AND u.auth_id = auth.uid()
        ) OR 
        EXISTS (
            SELECT 1 FROM admin_users au 
            WHERE au.auth_id = auth.uid()
        )
    );

-- Add auth_id column to usuarios if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'usuarios' 
        AND column_name = 'auth_id'
    ) THEN
        ALTER TABLE usuarios ADD COLUMN auth_id UUID REFERENCES auth.users(id);
        CREATE INDEX idx_usuarios_auth_id ON usuarios(auth_id);
    END IF;
END $$;

-- Add auth_id column to admin_users if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'admin_users' 
        AND column_name = 'auth_id'
    ) THEN
        ALTER TABLE admin_users ADD COLUMN auth_id UUID REFERENCES auth.users(id);
        CREATE INDEX idx_admin_users_auth_id ON admin_users(auth_id);
    END IF;
END $$;

-- Grant necessary permissions
GRANT ALL ON uso_voucher TO authenticated;

-- Add comments
COMMENT ON VIEW vw_uso_voucher_detalhado IS 'View detalhada do uso de vouchers com identificação do usuário autenticado';
COMMENT ON COLUMN vw_uso_voucher_detalhado.authenticated_user IS 'ID do usuário autenticado atual';