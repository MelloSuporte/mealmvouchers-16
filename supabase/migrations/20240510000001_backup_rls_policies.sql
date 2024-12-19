-- Backup of all RLS Policies
-- Generated on: 2024-05-10

-- Enable RLS on all tables
ALTER TABLE empresas ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE turnos ENABLE ROW LEVEL SECURITY;
ALTER TABLE setores ENABLE ROW LEVEL SECURITY;
ALTER TABLE vouchers_descartaveis ENABLE ROW LEVEL SECURITY;
ALTER TABLE vouchers_extras ENABLE ROW LEVEL SECURITY;
ALTER TABLE uso_voucher ENABLE ROW LEVEL SECURITY;
ALTER TABLE tipos_refeicao ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "usuarios_voucher_select_policy" ON usuarios;
DROP POLICY IF EXISTS "usuarios_voucher_update_policy" ON usuarios;
DROP POLICY IF EXISTS "uso_voucher_comum_insert_policy" ON uso_voucher;
DROP POLICY IF EXISTS "uso_voucher_comum_select_policy" ON uso_voucher;
DROP POLICY IF EXISTS "vouchers_descartaveis_select_policy" ON vouchers_descartaveis;
DROP POLICY IF EXISTS "vouchers_descartaveis_update_policy" ON vouchers_descartaveis;
DROP POLICY IF EXISTS "vouchers_descartaveis_insert_policy" ON vouchers_descartaveis;
DROP POLICY IF EXISTS "vouchers_extras_select_policy" ON vouchers_extras;
DROP POLICY IF EXISTS "vouchers_extras_insert_policy" ON vouchers_extras;
DROP POLICY IF EXISTS "vouchers_extras_update_policy" ON vouchers_extras;

-- Policies for usuarios table
CREATE POLICY "usuarios_voucher_select_policy" ON usuarios
    FOR SELECT TO authenticated
    USING (
        id = auth.uid()
        OR 
        EXISTS (
            SELECT 1 FROM admin_users au
            WHERE au.id = auth.uid()
            AND au.permissoes->>'gerenciar_usuarios' = 'true'
            AND NOT au.suspenso
        )
    );

CREATE POLICY "usuarios_voucher_update_policy" ON usuarios
    FOR UPDATE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM admin_users au
            WHERE au.id = auth.uid()
            AND au.permissoes->>'sistema' = 'true'
        )
    );

-- Policies for uso_voucher table
CREATE POLICY "uso_voucher_comum_insert_policy" ON uso_voucher
    FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM admin_users au
            WHERE au.id = auth.uid()
            AND au.permissoes->>'sistema' = 'true'
        )
    );

CREATE POLICY "uso_voucher_comum_select_policy" ON uso_voucher
    FOR SELECT TO authenticated
    USING (
        usuario_id = auth.uid()
        OR
        EXISTS (
            SELECT 1 FROM admin_users au
            WHERE au.id = auth.uid()
            AND au.permissoes->>'gerenciar_usuarios' = 'true'
            AND NOT au.suspenso
        )
    );

-- Policies for vouchers_descartaveis table
CREATE POLICY "vouchers_descartaveis_select_policy" ON vouchers_descartaveis
    FOR SELECT TO authenticated
    USING (
        -- Voucher não usado e dentro da validade
        NOT usado 
        AND CURRENT_DATE <= data_expiracao::date
        AND codigo IS NOT NULL
        AND EXISTS (
            SELECT 1 FROM tipos_refeicao tr
            WHERE tr.id = tipo_refeicao_id
            AND tr.ativo = true
            AND CURRENT_TIME BETWEEN tr.horario_inicio 
            AND (tr.horario_fim + (tr.minutos_tolerancia || ' minutes')::INTERVAL)
        )
    );

CREATE POLICY "vouchers_descartaveis_update_policy" ON vouchers_descartaveis
    FOR UPDATE TO authenticated
    USING (
        NOT usado 
        AND CURRENT_DATE <= data_expiracao::date
        AND EXISTS (
            SELECT 1 FROM tipos_refeicao tr
            WHERE tr.id = tipo_refeicao_id
            AND tr.ativo = true
            AND CURRENT_TIME BETWEEN tr.horario_inicio 
            AND (tr.horario_fim + (tr.minutos_tolerancia || ' minutes')::INTERVAL)
        )
    )
    WITH CHECK (
        usado = true
        AND NEW.id = OLD.id
        AND NEW.tipo_refeicao_id = OLD.tipo_refeicao_id
        AND NEW.codigo = OLD.codigo
        AND NEW.data_expiracao = OLD.data_expiracao
    );

CREATE POLICY "vouchers_descartaveis_insert_policy" ON vouchers_descartaveis
    FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM usuarios u
            WHERE u.id = auth.uid()
            AND u.role IN ('admin', 'gestor')
            AND NOT u.suspenso
        )
    );

-- Policies for vouchers_extras table
CREATE POLICY "vouchers_extras_select_policy" ON vouchers_extras
    FOR SELECT TO authenticated
    USING (
        usuario_id = auth.uid()
        OR
        EXISTS (
            SELECT 1 FROM admin_users au
            WHERE au.id = auth.uid()
            AND au.permissoes->>'gerenciar_usuarios' = 'true'
            AND NOT au.suspenso
        )
    );

CREATE POLICY "vouchers_extras_insert_policy" ON vouchers_extras
    FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM admin_users au
            WHERE au.id = auth.uid()
            AND au.permissoes->>'gerenciar_vouchers_extra' = 'true'
            AND NOT au.suspenso
        )
    );

CREATE POLICY "vouchers_extras_update_policy" ON vouchers_extras
    FOR UPDATE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM admin_users au
            WHERE au.id = auth.uid()
            AND au.permissoes->>'gerenciar_vouchers_extra' = 'true'
            AND NOT au.suspenso
        )
    );

-- Policies for tipos_refeicao table
CREATE POLICY "tipos_refeicao_select_policy" ON tipos_refeicao
    FOR SELECT TO authenticated, anon
    USING (true);

CREATE POLICY "tipos_refeicao_insert_policy" ON tipos_refeicao
    FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM usuarios u
            WHERE u.id = auth.uid()
            AND u.role = 'admin'
            AND NOT u.suspenso
        )
    );

-- Policies for empresas table
CREATE POLICY "empresas_select_policy" ON empresas
    FOR SELECT TO authenticated
    USING (true);

CREATE POLICY "empresas_insert_policy" ON empresas
    FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM usuarios u
            WHERE u.id = auth.uid()
            AND u.role = 'admin'
            AND NOT u.suspenso
        )
    );

-- Policies for turnos table
CREATE POLICY "turnos_select_policy" ON turnos
    FOR SELECT TO authenticated
    USING (true);

CREATE POLICY "turnos_insert_policy" ON turnos
    FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM usuarios u
            WHERE u.id = auth.uid()
            AND u.role = 'admin'
            AND NOT u.suspenso
        )
    );

-- Add helpful comments
COMMENT ON POLICY "usuarios_voucher_select_policy" ON usuarios IS 'Controla acesso de leitura aos vouchers comuns';
COMMENT ON POLICY "usuarios_voucher_update_policy" ON usuarios IS 'Apenas sistema pode atualizar vouchers';
COMMENT ON POLICY "uso_voucher_comum_insert_policy" ON uso_voucher IS 'Controla registro de uso de vouchers comuns';
COMMENT ON POLICY "uso_voucher_comum_select_policy" ON uso_voucher IS 'Controla visualização do histórico de uso';
COMMENT ON POLICY "vouchers_descartaveis_select_policy" ON vouchers_descartaveis IS 'Permite visualizar apenas vouchers válidos, não utilizados e dentro do horário permitido';
COMMENT ON POLICY "vouchers_descartaveis_update_policy" ON vouchers_descartaveis IS 'Permite apenas marcar vouchers como usados quando dentro do horário permitido';
COMMENT ON POLICY "vouchers_descartaveis_insert_policy" ON vouchers_descartaveis IS 'Permite apenas administradores e gestores criarem novos vouchers';

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_vouchers_descartaveis_codigo ON vouchers_descartaveis(codigo);
CREATE INDEX IF NOT EXISTS idx_vouchers_descartaveis_data_expiracao ON vouchers_descartaveis(data_expiracao);
CREATE INDEX IF NOT EXISTS idx_vouchers_descartaveis_usado ON vouchers_descartaveis(usado);
CREATE INDEX IF NOT EXISTS idx_uso_voucher_usuario ON uso_voucher(usuario_id);
CREATE INDEX IF NOT EXISTS idx_uso_voucher_data ON uso_voucher(usado_em);