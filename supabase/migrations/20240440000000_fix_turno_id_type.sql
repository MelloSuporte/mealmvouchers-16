-- Primeiro, remover as policies que dependem da coluna id
DROP POLICY IF EXISTS "uso_voucher_insert_policy" ON uso_voucher;
DROP POLICY IF EXISTS "uso_voucher_select_policy" ON uso_voucher;

-- Remover a constraint existente
ALTER TABLE usuarios DROP CONSTRAINT IF EXISTS fk_usuarios_turnos;

-- Remover o valor padrão da coluna id antes de alterar o tipo
ALTER TABLE turnos ALTER COLUMN id DROP DEFAULT;

-- Adicionar coluna UUID temporária em usuarios
ALTER TABLE usuarios ADD COLUMN turno_id_uuid UUID;

-- Alterar o tipo da coluna id na tabela turnos para UUID
ALTER TABLE turnos
ADD COLUMN id_uuid UUID;

-- Criar uma tabela temporária para mapear IDs antigos a novos UUIDs
CREATE TEMP TABLE id_mapping AS
SELECT id, gen_random_uuid() as new_uuid
FROM turnos;

-- Atualizar a nova coluna com os UUIDs correspondentes
UPDATE turnos t
SET id_uuid = m.new_uuid
FROM id_mapping m
WHERE t.id = m.id;

-- Atualizar a referência na tabela usuarios
UPDATE usuarios u
SET turno_id_uuid = t.id_uuid
FROM turnos t
WHERE u.turno_id = t.id;

-- Remover a coluna antiga e renomear a nova em turnos
ALTER TABLE turnos DROP COLUMN id;
ALTER TABLE turnos RENAME COLUMN id_uuid TO id;

-- Remover a coluna antiga e renomear a nova em usuarios
ALTER TABLE usuarios DROP COLUMN turno_id;
ALTER TABLE usuarios RENAME COLUMN turno_id_uuid TO turno_id;

-- Adicionar a constraint de primary key na nova coluna
ALTER TABLE turnos ADD PRIMARY KEY (id);

-- Recriar a foreign key constraint
ALTER TABLE usuarios
ADD CONSTRAINT fk_usuarios_turnos
FOREIGN KEY (turno_id)
REFERENCES turnos(id);

-- Criar índice para melhorar performance
CREATE INDEX IF NOT EXISTS idx_usuarios_turno_id ON usuarios(turno_id);

-- Recriar as policies
CREATE POLICY "uso_voucher_insert_policy" ON uso_voucher
    FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM usuarios u
            JOIN turnos t ON t.id = u.turno_id
            JOIN tipos_refeicao tr ON tr.id = tipo_refeicao_id
            WHERE u.id = usuario_id
            AND t.ativo = true
            AND tr.ativo = true
            AND CURRENT_TIME BETWEEN t.horario_inicio AND t.horario_fim
            AND CURRENT_TIME BETWEEN tr.horario_inicio 
                AND tr.horario_fim + (tr.minutos_tolerancia || ' minutes')::INTERVAL
        )
    );

CREATE POLICY "uso_voucher_select_policy" ON uso_voucher
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

-- Adicionar comentários explicativos
COMMENT ON POLICY "uso_voucher_insert_policy" ON uso_voucher 
IS 'Controla inserção de registros de uso de vouchers com validação de horários';

COMMENT ON POLICY "uso_voucher_select_policy" ON uso_voucher 
IS 'Controla visualização do histórico de uso de vouchers';