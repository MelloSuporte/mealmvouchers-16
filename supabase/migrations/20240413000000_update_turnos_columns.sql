-- Primeiro fazemos backup dos dados existentes
CREATE TABLE turnos_backup AS SELECT * FROM turnos;

-- Removemos a tabela existente
DROP TABLE turnos;

-- Recriamos a tabela com a estrutura correta
CREATE TABLE IF NOT EXISTS turnos (
  id SERIAL PRIMARY KEY,
  tipo_turno VARCHAR(10) CHECK (tipo_turno IN ('central', 'primeiro', 'segundo', 'terceiro')),
  horario_inicio TIME NOT NULL,
  horario_fim TIME NOT NULL,
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Reinsere os dados do backup com os nomes corretos das colunas
INSERT INTO turnos (tipo_turno, horario_inicio, horario_fim, ativo, created_at, updated_at)
SELECT tipo_turno, horario_inicio, horario_fim, ativo, created_at, updated_at
FROM turnos_backup;

-- Remove a tabela de backup
DROP TABLE turnos_backup;

-- Reinsere os dados padrão caso necessário
INSERT INTO turnos (tipo_turno, horario_inicio, horario_fim, ativo) 
SELECT t.tipo_turno, t.horario_inicio, t.horario_fim, t.ativo
FROM (VALUES 
    ('central', '08:00:00', '17:00:00', true),
    ('primeiro', '06:00:00', '14:00:00', true),
    ('segundo', '14:00:00', '22:00:00', true),
    ('terceiro', '22:00:00', '06:00:00', true)
) AS t(tipo_turno, horario_inicio, horario_fim, ativo)
WHERE NOT EXISTS (
    SELECT 1 FROM turnos
);