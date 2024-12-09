-- Backup completo do esquema do Sistema de Gestão de Vouchers
-- Gerado em: 2024-12-08

-- Configurações iniciais
SET statement_timeout = 0;
SET lock_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

-- Criar schema public se não existir
CREATE SCHEMA IF NOT EXISTS public;

-- Configurar search_path
ALTER SCHEMA public OWNER TO postgres;
SET search_path TO public;

-- Limpar objetos existentes
DROP TABLE IF EXISTS admin_users CASCADE;
DROP TABLE IF EXISTS usuarios CASCADE;
DROP TABLE IF EXISTS tipos_refeicao CASCADE;
DROP TABLE IF EXISTS vouchers_descartaveis CASCADE;
DROP TABLE IF EXISTS vouchers_extras CASCADE;
DROP TABLE IF EXISTS uso_voucher CASCADE;
DROP TABLE IF EXISTS configuracoes CASCADE;
DROP TABLE IF EXISTS feriados CASCADE;
DROP TABLE IF EXISTS logs_sistema CASCADE;

-- Criar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Tabela admin_users
CREATE TABLE admin_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR NOT NULL UNIQUE,
    nome VARCHAR NOT NULL,
    permissoes JSONB DEFAULT '{}'::jsonb,
    suspenso BOOLEAN DEFAULT false,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_users_select_policy" ON admin_users
    FOR SELECT TO authenticated
    USING (true);

CREATE POLICY "admin_users_insert_policy" ON admin_users
    FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM admin_users au
            WHERE au.id = auth.uid()
            AND au.permissoes->>'gerenciar_usuarios' = 'true'
            AND NOT au.suspenso
        )
    );

CREATE POLICY "admin_users_update_policy" ON admin_users
    FOR UPDATE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM admin_users au
            WHERE au.id = auth.uid()
            AND au.permissoes->>'gerenciar_usuarios' = 'true'
            AND NOT au.suspenso
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM admin_users au
            WHERE au.id = auth.uid()
            AND au.permissoes->>'gerenciar_usuarios' = 'true'
            AND NOT au.suspenso
        )
    );

-- Tabela usuarios
CREATE TABLE usuarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR NOT NULL,
    email VARCHAR NOT NULL UNIQUE,
    matricula VARCHAR UNIQUE,
    departamento VARCHAR,
    cargo VARCHAR,
    suspenso BOOLEAN DEFAULT false,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "usuarios_select_policy" ON usuarios
    FOR SELECT TO authenticated
    USING (true);

CREATE POLICY "usuarios_insert_policy" ON usuarios
    FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM admin_users au
            WHERE au.id = auth.uid()
            AND au.permissoes->>'gerenciar_usuarios' = 'true'
            AND NOT au.suspenso
        )
    );

CREATE POLICY "usuarios_update_policy" ON usuarios
    FOR UPDATE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM admin_users au
            WHERE au.id = auth.uid()
            AND au.permissoes->>'gerenciar_usuarios' = 'true'
            AND NOT au.suspenso
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM admin_users au
            WHERE au.id = auth.uid()
            AND au.permissoes->>'gerenciar_usuarios' = 'true'
            AND NOT au.suspenso
        )
    );

-- Tabela tipos_refeicao
CREATE TABLE tipos_refeicao (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR NOT NULL UNIQUE,
    descricao TEXT,
    ativo BOOLEAN DEFAULT true,
    ordem INTEGER,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE tipos_refeicao ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tipos_refeicao_select_policy" ON tipos_refeicao
    FOR SELECT TO authenticated
    USING (true);

CREATE POLICY "tipos_refeicao_insert_policy" ON tipos_refeicao
    FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM admin_users au
            WHERE au.id = auth.uid()
            AND au.permissoes->>'gerenciar_tipos_refeicao' = 'true'
            AND NOT au.suspenso
        )
    );

CREATE POLICY "tipos_refeicao_update_policy" ON tipos_refeicao
    FOR UPDATE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM admin_users au
            WHERE au.id = auth.uid()
            AND au.permissoes->>'gerenciar_tipos_refeicao' = 'true'
            AND NOT au.suspenso
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM admin_users au
            WHERE au.id = auth.uid()
            AND au.permissoes->>'gerenciar_tipos_refeicao' = 'true'
            AND NOT au.suspenso
        )
    );

-- Tabela vouchers_descartaveis
CREATE TABLE vouchers_descartaveis (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    codigo UUID UNIQUE NOT NULL DEFAULT uuid_generate_v4(),
    tipo_refeicao VARCHAR NOT NULL,
    usuario_id UUID REFERENCES usuarios(id),
    validade DATE NOT NULL,
    status VARCHAR DEFAULT 'ativo' CHECK (status IN ('ativo', 'usado', 'cancelado', 'expirado')),
    observacao TEXT,
    usado_em TIMESTAMP WITH TIME ZONE,
    criado_por UUID REFERENCES auth.users(id),
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE vouchers_descartaveis ENABLE ROW LEVEL SECURITY;

CREATE POLICY "vouchers_descartaveis_select_policy" ON vouchers_descartaveis
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM admin_users au
            WHERE au.id = auth.uid()
            AND (
                au.permissoes->>'gerenciar_vouchers' = 'true'
                OR au.permissoes->>'gerenciar_relatorios' = 'true'
            )
            AND NOT au.suspenso
        )
        OR criado_por = auth.uid()
        OR usuario_id = auth.uid()
    );

CREATE POLICY "vouchers_descartaveis_insert_policy" ON vouchers_descartaveis
    FOR INSERT TO authenticated
    WITH CHECK (
        (current_setting('app.inserting_voucher_descartavel', true))::boolean
        OR
        EXISTS (
            SELECT 1 FROM admin_users au
            WHERE au.id = auth.uid()
            AND au.permissoes->>'gerenciar_vouchers' = 'true'
            AND NOT au.suspenso
        )
    );

CREATE POLICY "vouchers_descartaveis_update_policy" ON vouchers_descartaveis
    FOR UPDATE TO authenticated
    USING (
        (current_setting('app.updating_voucher_descartavel', true))::boolean
        OR
        EXISTS (
            SELECT 1 FROM admin_users au
            WHERE au.id = auth.uid()
            AND au.permissoes->>'gerenciar_vouchers' = 'true'
            AND NOT au.suspenso
        )
    )
    WITH CHECK (
        (current_setting('app.updating_voucher_descartavel', true))::boolean
        OR
        EXISTS (
            SELECT 1 FROM admin_users au
            WHERE au.id = auth.uid()
            AND au.permissoes->>'gerenciar_vouchers' = 'true'
            AND NOT au.suspenso
        )
    );

-- Tabela vouchers_extras
CREATE TABLE vouchers_extras (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    codigo UUID UNIQUE NOT NULL DEFAULT uuid_generate_v4(),
    tipo_refeicao VARCHAR NOT NULL,
    usuario_id UUID REFERENCES usuarios(id),
    validade DATE NOT NULL,
    status VARCHAR DEFAULT 'ativo' CHECK (status IN ('ativo', 'usado', 'cancelado', 'expirado')),
    motivo TEXT NOT NULL,
    usado_em TIMESTAMP WITH TIME ZONE,
    criado_por UUID REFERENCES auth.users(id),
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE vouchers_extras ENABLE ROW LEVEL SECURITY;

CREATE POLICY "vouchers_extras_select_policy" ON vouchers_extras
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM admin_users au
            WHERE au.id = auth.uid()
            AND (
                au.permissoes->>'gerenciar_vouchers' = 'true'
                OR au.permissoes->>'gerenciar_relatorios' = 'true'
            )
            AND NOT au.suspenso
        )
        OR criado_por = auth.uid()
        OR usuario_id = auth.uid()
    );

CREATE POLICY "vouchers_extras_insert_policy" ON vouchers_extras
    FOR INSERT TO authenticated
    WITH CHECK (
        (current_setting('app.inserting_voucher_extra', true))::boolean
        OR
        EXISTS (
            SELECT 1 FROM admin_users au
            WHERE au.id = auth.uid()
            AND au.permissoes->>'gerenciar_vouchers' = 'true'
            AND NOT au.suspenso
        )
    );

CREATE POLICY "vouchers_extras_update_policy" ON vouchers_extras
    FOR UPDATE TO authenticated
    USING (
        (current_setting('app.updating_voucher_extra', true))::boolean
        OR
        EXISTS (
            SELECT 1 FROM admin_users au
            WHERE au.id = auth.uid()
            AND au.permissoes->>'gerenciar_vouchers' = 'true'
            AND NOT au.suspenso
        )
    )
    WITH CHECK (
        (current_setting('app.updating_voucher_extra', true))::boolean
        OR
        EXISTS (
            SELECT 1 FROM admin_users au
            WHERE au.id = auth.uid()
            AND au.permissoes->>'gerenciar_vouchers' = 'true'
            AND NOT au.suspenso
        )
    );

-- Tabela uso_voucher
CREATE TABLE uso_voucher (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    voucher_id UUID NOT NULL,
    tipo_voucher VARCHAR NOT NULL CHECK (tipo_voucher IN ('descartavel', 'extra')),
    usuario_id UUID REFERENCES usuarios(id),
    tipo_refeicao VARCHAR NOT NULL,
    data_uso TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    criado_por UUID REFERENCES auth.users(id),
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uso_voucher_voucher_fk 
        CHECK (
            (tipo_voucher = 'descartavel' AND 
             EXISTS(SELECT 1 FROM vouchers_descartaveis WHERE id = voucher_id))
            OR
            (tipo_voucher = 'extra' AND 
             EXISTS(SELECT 1 FROM vouchers_extras WHERE id = voucher_id))
        )
);

ALTER TABLE uso_voucher ENABLE ROW LEVEL SECURITY;

CREATE POLICY "uso_voucher_select_policy" ON uso_voucher
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM admin_users au
            WHERE au.id = auth.uid()
            AND (
                au.permissoes->>'gerenciar_vouchers' = 'true'
                OR au.permissoes->>'gerenciar_relatorios' = 'true'
            )
            AND NOT au.suspenso
        )
        OR usuario_id = auth.uid()
    );

CREATE POLICY "uso_voucher_insert_policy" ON uso_voucher
    FOR INSERT TO authenticated
    WITH CHECK (
        (current_setting('app.inserting_uso_voucher', true))::boolean
    );

-- Tabela configuracoes
CREATE TABLE configuracoes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    chave VARCHAR NOT NULL UNIQUE,
    valor JSONB NOT NULL,
    descricao TEXT,
    criado_por UUID REFERENCES auth.users(id),
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE configuracoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "configuracoes_select_policy" ON configuracoes
    FOR SELECT TO authenticated
    USING (true);

CREATE POLICY "configuracoes_insert_policy" ON configuracoes
    FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM admin_users au
            WHERE au.id = auth.uid()
            AND au.permissoes->>'gerenciar_configuracoes' = 'true'
            AND NOT au.suspenso
        )
    );

CREATE POLICY "configuracoes_update_policy" ON configuracoes
    FOR UPDATE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM admin_users au
            WHERE au.id = auth.uid()
            AND au.permissoes->>'gerenciar_configuracoes' = 'true'
            AND NOT au.suspenso
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM admin_users au
            WHERE au.id = auth.uid()
            AND au.permissoes->>'gerenciar_configuracoes' = 'true'
            AND NOT au.suspenso
        )
    );

-- Tabela feriados
CREATE TABLE feriados (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    data DATE NOT NULL UNIQUE,
    descricao VARCHAR NOT NULL,
    tipo VARCHAR NOT NULL CHECK (tipo IN ('nacional', 'estadual', 'municipal', 'facultativo')),
    criado_por UUID REFERENCES auth.users(id),
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE feriados ENABLE ROW LEVEL SECURITY;

CREATE POLICY "feriados_select_policy" ON feriados
    FOR SELECT TO authenticated
    USING (true);

CREATE POLICY "feriados_insert_policy" ON feriados
    FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM admin_users au
            WHERE au.id = auth.uid()
            AND au.permissoes->>'gerenciar_feriados' = 'true'
            AND NOT au.suspenso
        )
    );

CREATE POLICY "feriados_update_policy" ON feriados
    FOR UPDATE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM admin_users au
            WHERE au.id = auth.uid()
            AND au.permissoes->>'gerenciar_feriados' = 'true'
            AND NOT au.suspenso
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM admin_users au
            WHERE au.id = auth.uid()
            AND au.permissoes->>'gerenciar_feriados' = 'true'
            AND NOT au.suspenso
        )
    );

-- Tabela logs_sistema
CREATE TABLE logs_sistema (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tipo VARCHAR NOT NULL,
    mensagem TEXT NOT NULL,
    detalhes JSONB,
    nivel VARCHAR NOT NULL CHECK (nivel IN ('debug', 'info', 'warning', 'error', 'critical')),
    usuario_id UUID REFERENCES auth.users(id),
    ip_address VARCHAR,
    user_agent TEXT,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE logs_sistema ENABLE ROW LEVEL SECURITY;

CREATE POLICY "logs_sistema_select_policy" ON logs_sistema
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM admin_users au
            WHERE au.id = auth.uid()
            AND (
                au.permissoes->>'gerenciar_logs' = 'true'
                OR au.permissoes->>'gerenciar_relatorios' = 'true'
            )
            AND NOT au.suspenso
        )
    );

CREATE POLICY "logs_sistema_insert_policy" ON logs_sistema
    FOR INSERT TO authenticated
    WITH CHECK (
        (current_setting('app.inserting_log_sistema', true))::boolean
    );

-- Funções
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.atualizado_em = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;

-- Triggers para atualização automática de timestamps
CREATE TRIGGER update_admin_users_updated_at
    BEFORE UPDATE ON admin_users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_usuarios_updated_at
    BEFORE UPDATE ON usuarios
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_tipos_refeicao_updated_at
    BEFORE UPDATE ON tipos_refeicao
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_vouchers_descartaveis_updated_at
    BEFORE UPDATE ON vouchers_descartaveis
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_vouchers_extras_updated_at
    BEFORE UPDATE ON vouchers_extras
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_uso_voucher_updated_at
    BEFORE UPDATE ON uso_voucher
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_configuracoes_updated_at
    BEFORE UPDATE ON configuracoes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_feriados_updated_at
    BEFORE UPDATE ON feriados
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- Índices
CREATE INDEX idx_admin_users_email ON admin_users(email);
CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_usuarios_matricula ON usuarios(matricula);
CREATE INDEX idx_tipos_refeicao_nome ON tipos_refeicao(nome);
CREATE INDEX idx_vouchers_descartaveis_codigo ON vouchers_descartaveis(codigo);
CREATE INDEX idx_vouchers_descartaveis_usuario ON vouchers_descartaveis(usuario_id);
CREATE INDEX idx_vouchers_extras_codigo ON vouchers_extras(codigo);
CREATE INDEX idx_vouchers_extras_usuario ON vouchers_extras(usuario_id);
CREATE INDEX idx_uso_voucher_voucher ON uso_voucher(voucher_id);
CREATE INDEX idx_uso_voucher_usuario ON uso_voucher(usuario_id);
CREATE INDEX idx_feriados_data ON feriados(data);
CREATE INDEX idx_logs_sistema_tipo ON logs_sistema(tipo);
CREATE INDEX idx_logs_sistema_nivel ON logs_sistema(nivel);
CREATE INDEX idx_logs_sistema_usuario ON logs_sistema(usuario_id);

-- Comentários
COMMENT ON TABLE admin_users IS 'Usuários administradores do sistema';
COMMENT ON TABLE usuarios IS 'Usuários que podem receber e usar vouchers';
COMMENT ON TABLE tipos_refeicao IS 'Tipos de refeição disponíveis';
COMMENT ON TABLE vouchers_descartaveis IS 'Vouchers descartáveis para uso único';
COMMENT ON TABLE vouchers_extras IS 'Vouchers extras com motivo específico';
COMMENT ON TABLE uso_voucher IS 'Registro de uso dos vouchers';
COMMENT ON TABLE configuracoes IS 'Configurações do sistema';
COMMENT ON TABLE feriados IS 'Cadastro de feriados';
COMMENT ON TABLE logs_sistema IS 'Logs de atividades do sistema';
