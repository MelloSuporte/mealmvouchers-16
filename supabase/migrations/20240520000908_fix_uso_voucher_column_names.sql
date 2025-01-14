-- Remove políticas existentes
DROP POLICY IF EXISTS "uso_voucher_insert_policy" ON uso_voucher;
DROP POLICY IF EXISTS "uso_voucher_select_policy" ON uso_voucher;

-- Habilita RLS
ALTER TABLE uso_voucher ENABLE ROW LEVEL SECURITY;

-- Adiciona coluna voucher_descartavel_id se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'uso_voucher' 
        AND column_name = 'voucher_descartavel_id'
    ) THEN
        ALTER TABLE uso_voucher 
        ADD COLUMN voucher_descartavel_id UUID REFERENCES vouchers_descartaveis(id);
    END IF;
END $$;

-- Cria política unificada de inserção com referências corretas de colunas
CREATE POLICY "uso_voucher_insert_policy" ON uso_voucher
    FOR INSERT TO authenticated, anon
    WITH CHECK (
        -- Permite que o sistema registre uso de voucher
        EXISTS (
            SELECT 1 FROM admin_users au
            WHERE au.id = auth.uid()
            AND au.permissoes->>'sistema' = 'true'
        )
        OR
        -- Permite que usuários anônimos registrem uso de voucher descartável
        EXISTS (
            SELECT 1 FROM vouchers_descartaveis vd
            WHERE vd.id = voucher_descartavel_id
            AND vd.usado_em IS NULL
            AND CURRENT_DATE <= vd.data_expiracao::date
            AND EXISTS (
                SELECT 1 FROM tipos_refeicao tr
                WHERE tr.id = tipo_refeicao_id
                AND tr.ativo = true
                AND CURRENT_TIME BETWEEN tr.horario_inicio 
                AND (tr.horario_fim + (tr.minutos_tolerancia || ' minutes')::INTERVAL)
            )
        )
    );

-- Cria política de seleção
CREATE POLICY "uso_voucher_select_policy" ON uso_voucher
    FOR SELECT TO authenticated, anon
    USING (
        -- Usuários autenticados podem ver seus próprios registros
        (auth.uid() IS NOT NULL AND usuario_id = auth.uid())
        OR
        -- Administradores podem ver todos os registros
        (
            EXISTS (
                SELECT 1 FROM admin_users au
                WHERE au.id = auth.uid()
                AND au.permissoes->>'gerenciar_usuarios' = 'true'
                AND NOT au.suspenso
            )
        )
        OR
        -- Usuários anônimos podem ver uso de voucher descartável
        (
            auth.uid() IS NULL 
            AND voucher_descartavel_id IS NOT NULL
        )
    );

-- Cria índice para melhor performance
CREATE INDEX IF NOT EXISTS idx_uso_voucher_descartavel_id 
ON uso_voucher(voucher_descartavel_id);

-- Concede permissões necessárias
GRANT SELECT, INSERT ON uso_voucher TO anon;
GRANT SELECT ON tipos_refeicao TO anon;

-- Adiciona comentários explicativos
COMMENT ON POLICY "uso_voucher_insert_policy" ON uso_voucher IS 
'Permite que o sistema e usuários anônimos registrem uso de vouchers com validações específicas';

COMMENT ON POLICY "uso_voucher_select_policy" ON uso_voucher IS 
'Permite visualização do histórico de uso de vouchers para usuários autenticados e anônimos';