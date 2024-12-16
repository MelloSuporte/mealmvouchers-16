-- Enable RLS
ALTER TABLE tipos_refeicao ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "tipos_refeicao_select_policy" ON tipos_refeicao;
DROP POLICY IF EXISTS "tipos_refeicao_insert_policy" ON tipos_refeicao;
DROP POLICY IF EXISTS "tipos_refeicao_update_policy" ON tipos_refeicao;

-- Create new policies
CREATE POLICY "tipos_refeicao_select_policy" ON tipos_refeicao
    FOR SELECT USING (
        -- Todos podem visualizar tipos de refeição ativos
        ativo = true
        OR 
        -- Admins podem ver todos
        EXISTS (
            SELECT 1 FROM usuarios u
            WHERE u.id = auth.uid()
            AND u.role = 'admin'
            AND NOT u.suspenso
        )
    );

CREATE POLICY "tipos_refeicao_insert_policy" ON tipos_refeicao
    FOR INSERT WITH CHECK (
        -- Apenas admins podem inserir
        EXISTS (
            SELECT 1 FROM usuarios u
            WHERE u.id = auth.uid()
            AND u.role = 'admin'
            AND NOT u.suspenso
        )
    );

CREATE POLICY "tipos_refeicao_update_policy" ON tipos_refeicao
    FOR UPDATE USING (
        -- Apenas admins podem atualizar
        EXISTS (
            SELECT 1 FROM usuarios u
            WHERE u.id = auth.uid()
            AND u.role = 'admin'
            AND NOT u.suspenso
        )
    );

-- Fix view permissions
GRANT SELECT ON vw_uso_voucher_detalhado TO authenticated;
GRANT SELECT ON tipos_refeicao TO authenticated;
GRANT SELECT ON uso_voucher TO authenticated;