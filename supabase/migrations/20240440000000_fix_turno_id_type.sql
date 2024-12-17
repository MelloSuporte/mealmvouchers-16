-- Primeiro, remover a constraint existente
ALTER TABLE usuarios DROP CONSTRAINT IF EXISTS fk_usuarios_turnos;

-- Adicionar uma coluna temporária para fazer a migração
ALTER TABLE usuarios ADD COLUMN turno_id_uuid UUID;

-- Criar uma tabela temporária para mapear os IDs antigos com novos UUIDs
CREATE TEMP TABLE turno_id_mapping AS
SELECT 
    CASE tipo_turno
        WHEN 'central' THEN 1
        WHEN 'primeiro' THEN 2
        WHEN 'segundo' THEN 3
        WHEN 'terceiro' THEN 4
    END AS old_id,
    id::uuid AS new_uuid
FROM turnos;

-- Atualizar a nova coluna com os UUIDs correspondentes dos turnos
UPDATE usuarios u
SET turno_id_uuid = m.new_uuid
FROM turno_id_mapping m
WHERE u.turno_id::integer = m.old_id;

-- Remover a tabela temporária
DROP TABLE turno_id_mapping;

-- Remover a coluna antiga
ALTER TABLE usuarios DROP COLUMN turno_id;

-- Renomear a nova coluna
ALTER TABLE usuarios RENAME COLUMN turno_id_uuid TO turno_id;

-- Adicionar a nova foreign key constraint
ALTER TABLE usuarios
ADD CONSTRAINT fk_usuarios_turnos
FOREIGN KEY (turno_id)
REFERENCES turnos(id);

-- Adicionar índice para melhorar performance
CREATE INDEX IF NOT EXISTS idx_usuarios_turno_id ON usuarios(turno_id);