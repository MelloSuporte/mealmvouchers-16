-- Rename columns in tipos_refeicao table
ALTER TABLE tipos_refeicao 
  RENAME COLUMN hora_inicio TO horario_inicio;

ALTER TABLE tipos_refeicao 
  RENAME COLUMN hora_fim TO horario_fim;

-- Update RLS policies to use new column names
DROP POLICY IF EXISTS "Enable read access for all users" ON tipos_refeicao;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON tipos_refeicao;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON tipos_refeicao;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON tipos_refeicao;

-- Recreate policies with new column names
CREATE POLICY "Enable read access for all users"
ON tipos_refeicao FOR SELECT
TO authenticated, anon
USING (true);

CREATE POLICY "Enable insert for authenticated users only"
ON tipos_refeicao FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users only"
ON tipos_refeicao FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Enable delete for authenticated users only"
ON tipos_refeicao FOR DELETE
TO authenticated
USING (true);

-- Grant necessary permissions
GRANT ALL ON tipos_refeicao TO authenticated;
GRANT SELECT ON tipos_refeicao TO anon;
GRANT ALL ON tipos_refeicao TO service_role;