-- Enable RLS on all tables
ALTER TABLE empresas ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE turnos ENABLE ROW LEVEL SECURITY;
ALTER TABLE setores ENABLE ROW LEVEL SECURITY;
ALTER TABLE vouchers_descartaveis ENABLE ROW LEVEL SECURITY;
ALTER TABLE vouchers_extras ENABLE ROW LEVEL SECURITY;
ALTER TABLE uso_voucher ENABLE ROW LEVEL SECURITY;

-- Empresas policies
CREATE POLICY "Empresas visíveis para usuários autenticados"
ON empresas FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Apenas administradores podem gerenciar empresas"
ON empresas FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM auth.users
        WHERE auth.uid() = id
        AND raw_user_meta_data->>'role' = 'admin'
    )
);

-- Usuários policies
CREATE POLICY "Usuários podem ver seus próprios dados"
ON usuarios FOR SELECT
TO authenticated
USING (
    id = auth.uid() OR
    EXISTS (
        SELECT 1 FROM auth.users
        WHERE auth.uid() = id
        AND raw_user_meta_data->>'role' IN ('admin', 'manager')
    )
);

CREATE POLICY "Apenas admins e managers podem gerenciar usuários"
ON usuarios FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM auth.users
        WHERE auth.uid() = id
        AND raw_user_meta_data->>'role' IN ('admin', 'manager')
    )
);

-- Turnos policies
CREATE POLICY "Turnos visíveis para todos usuários autenticados"
ON turnos FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Apenas admins podem gerenciar turnos"
ON turnos FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM auth.users
        WHERE auth.uid() = id
        AND raw_user_meta_data->>'role' = 'admin'
    )
);

-- Setores policies
CREATE POLICY "Setores visíveis para todos usuários autenticados"
ON setores FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Apenas admins podem gerenciar setores"
ON setores FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM auth.users
        WHERE auth.uid() = id
        AND raw_user_meta_data->>'role' = 'admin'
    )
);

-- Vouchers descartáveis policies
CREATE POLICY "Usuários podem ver vouchers descartáveis disponíveis"
ON vouchers_descartaveis FOR SELECT
TO authenticated
USING (
    NOT usado OR
    EXISTS (
        SELECT 1 FROM auth.users
        WHERE auth.uid() = id
        AND raw_user_meta_data->>'role' IN ('admin', 'manager')
    )
);

CREATE POLICY "Apenas admins e managers podem gerenciar vouchers descartáveis"
ON vouchers_descartaveis FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM auth.users
        WHERE auth.uid() = id
        AND raw_user_meta_data->>'role' IN ('admin', 'manager')
    )
);

-- Vouchers extras policies
CREATE POLICY "Usuários podem ver seus vouchers extras"
ON vouchers_extras FOR SELECT
TO authenticated
USING (
    usuario_id = auth.uid() OR
    EXISTS (
        SELECT 1 FROM auth.users
        WHERE auth.uid() = id
        AND raw_user_meta_data->>'role' IN ('admin', 'manager')
    )
);

CREATE POLICY "Apenas admins e managers podem gerenciar vouchers extras"
ON vouchers_extras FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM auth.users
        WHERE auth.uid() = id
        AND raw_user_meta_data->>'role' IN ('admin', 'manager')
    )
);

-- Uso voucher policies
CREATE POLICY "Usuários podem ver seu próprio histórico de uso"
ON uso_voucher FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM vouchers_extras ve
        WHERE ve.id = voucher_id
        AND ve.usuario_id = auth.uid()
    ) OR
    EXISTS (
        SELECT 1 FROM auth.users
        WHERE auth.uid() = id
        AND raw_user_meta_data->>'role' IN ('admin', 'manager')
    )
);

CREATE POLICY "Apenas sistema pode registrar uso de voucher"
ON uso_voucher FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM auth.users
        WHERE auth.uid() = id
        AND raw_user_meta_data->>'role' IN ('admin', 'system')
    )
);

-- Grant necessary permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;