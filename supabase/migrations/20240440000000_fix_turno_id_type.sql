-- Primeiro, remover a constraint existente
ALTER TABLE usuarios DROP CONSTRAINT IF EXISTS fk_usuarios_turnos;

-- Adicionar uma coluna temporária para fazer a migração
ALTER TABLE usuarios ADD COLUMN turno_id_uuid UUID;

-- Criar uma tabela temporária para mapear os IDs antigos com novos UUIDs
CREATE TEMP TABLE turno_id_mapping AS
SELECT 
    id AS old_id,
    uuid_generate_v4() AS new_uuid
FROM turnos;

-- Atualizar a nova coluna com os UUIDs correspondentes dos turnos
UPDATE usuarios u
SET turno_id_uuid = m.new_uuid::uuid
FROM turno_id_mapping m
WHERE CAST(m.old_id AS INTEGER) = CAST(u.turno_id AS INTEGER);

-- Atualizar os IDs na tabela turnos
UPDATE turnos t
SET id = m.new_uuid::uuid
FROM turno_id_mapping m
WHERE CAST(t.id AS INTEGER) = CAST(m.old_id AS INTEGER);

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