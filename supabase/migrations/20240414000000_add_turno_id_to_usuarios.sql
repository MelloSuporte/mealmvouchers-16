-- Primeiro, adicionamos a nova coluna
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS turno_id INTEGER;

-- Em seguida, adicionamos a chave estrangeira
ALTER TABLE usuarios 
ADD CONSTRAINT fk_usuarios_turnos 
FOREIGN KEY (turno_id) 
REFERENCES turnos(id);

-- Atualizamos os registros existentes que possam ter o campo turno
UPDATE usuarios 
SET turno_id = t.id 
FROM turnos t 
WHERE usuarios.turno = t.tipo_turno;

-- Removemos a coluna antiga 'turno' que não será mais utilizada
ALTER TABLE usuarios DROP COLUMN IF EXISTS turno;