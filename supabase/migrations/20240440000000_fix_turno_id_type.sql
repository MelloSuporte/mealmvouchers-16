-- Primeiro, remover a constraint existente
ALTER TABLE usuarios DROP CONSTRAINT IF EXISTS fk_usuarios_turnos;

-- Adicionar uma coluna temporária para fazer a migração
ALTER TABLE usuarios ADD COLUMN turno_id_uuid UUID;

-- Atualizar a nova coluna com os UUIDs correspondentes dos turnos
UPDATE usuarios u
SET turno_id_uuid = (
    SELECT id 
    FROM turnos t 
    WHERE t.tipo_turno = (
        CASE u.turno_id::integer
            WHEN 1 THEN 'central'
            WHEN 2 THEN 'primeiro'
            WHEN 3 THEN 'segundo'
            WHEN 4 THEN 'terceiro'
            ELSE 'central'
        END
    )
);

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