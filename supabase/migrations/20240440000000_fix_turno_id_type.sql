-- Primeiro, remover as policies que dependem da coluna id
DROP POLICY IF EXISTS "uso_voucher_insert_policy" ON uso_voucher;
DROP POLICY IF EXISTS "uso_voucher_select_policy" ON uso_voucher;

-- Remover a view que depende da coluna id
DROP VIEW IF EXISTS vw_uso_voucher_detalhado;

-- Remover a constraint existente
ALTER TABLE usuarios DROP CONSTRAINT IF EXISTS fk_usuarios_turnos;

-- Adicionar coluna UUID temporária
ALTER TABLE turnos ADD COLUMN IF NOT EXISTS id_uuid UUID DEFAULT gen_random_uuid();

-- Criar tabela temporária para mapear IDs
CREATE TEMP TABLE IF NOT EXISTS turnos_id_map AS
SELECT id, id_uuid FROM turnos;

-- Atualizar referências na tabela usuarios
UPDATE usuarios u
SET turno_id = t.id_uuid
FROM turnos_id_map t
WHERE u.turno_id::text = t.id::text;

-- Alterar tipo da coluna id para UUID
ALTER TABLE turnos DROP COLUMN id CASCADE;
ALTER TABLE turnos RENAME COLUMN id_uuid TO id;
ALTER TABLE turnos ADD PRIMARY KEY (id);

-- Atualizar a constraint na tabela usuarios
ALTER TABLE usuarios
    ALTER COLUMN turno_id TYPE UUID USING turno_id::uuid;

ALTER TABLE usuarios
    ADD CONSTRAINT fk_usuarios_turnos
    FOREIGN KEY (turno_id)
    REFERENCES turnos(id);

-- Criar índice para melhorar performance
CREATE INDEX IF NOT EXISTS idx_usuarios_turno_id ON usuarios(turno_id);

-- Recriar a view com a nova estrutura e SECURITY INVOKER
CREATE OR REPLACE VIEW vw_uso_voucher_detalhado
WITH (security_barrier = true, security_invoker = true)
AS
SELECT 
    uv.id,
    uv.usado_em,
    uv.usado_em as data_uso,
    u.id as usuario_id,
    u.nome as nome_usuario,
    u.cpf,
    u.empresa_id,
    e.nome as nome_empresa,
    t.tipo_turno as turno,
    tr.nome as tipo_refeicao,
    tr.valor,
    uv.observacao
FROM uso_voucher uv
LEFT JOIN usuarios u ON uv.usuario_id = u.id
LEFT JOIN empresas e ON u.empresa_id = e.id
LEFT JOIN turnos t ON u.turno_id = t.id
LEFT JOIN tipos_refeicao tr ON uv.tipo_refeicao_id = tr.id;

-- Recriar as policies
CREATE POLICY "uso_voucher_insert_policy" ON uso_voucher
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

CREATE POLICY "uso_voucher_select_policy" ON uso_voucher
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

-- Grant permissions
GRANT SELECT ON vw_uso_voucher_detalhado TO authenticated;

-- Add comments
COMMENT ON VIEW vw_uso_voucher_detalhado IS 'View detalhada do uso de vouchers com informações relacionadas (SECURITY INVOKER)';