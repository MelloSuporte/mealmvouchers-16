-- Add criado_por column to refeicoes table
ALTER TABLE refeicoes 
ADD COLUMN IF NOT EXISTS criado_por UUID REFERENCES admin_users(id);

-- Update RLS policies to include criado_por
DROP POLICY IF EXISTS "Permitir insert/update para admins" ON refeicoes;

CREATE POLICY "Permitir insert/update para admins" ON refeicoes
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM admin_users au
            WHERE au.id = auth.uid()
            AND NOT au.suspenso
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM admin_users au
            WHERE au.id = auth.uid()
            AND NOT au.suspenso
        )
    );

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_refeicoes_criado_por ON refeicoes(criado_por);