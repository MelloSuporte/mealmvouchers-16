-- Backup completo do esquema do Sistema de Gestão de Vouchers
-- Gerado em: 2024-12-09

BEGIN;

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

-- Criar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Tabela admin_users
CREATE TABLE IF NOT EXISTS admin_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR NOT NULL UNIQUE,
    nome VARCHAR NOT NULL,
    permissoes JSONB DEFAULT '{}'::jsonb,
    suspenso BOOLEAN DEFAULT false,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_users_select_policy" ON admin_users;
CREATE POLICY "admin_users_select_policy" ON admin_users
    FOR SELECT TO authenticated
    USING (true);

DROP POLICY IF EXISTS "admin_users_insert_policy" ON admin_users;
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

DROP POLICY IF EXISTS "admin_users_update_policy" ON admin_users;
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

-- Outras tabelas e políticas seguem o mesmo padrão...
-- (O resto do seu schema SQL continua aqui...)

COMMIT;
