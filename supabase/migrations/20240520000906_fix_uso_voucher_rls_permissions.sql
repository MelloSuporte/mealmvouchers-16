-- Drop existing policies
DROP POLICY IF EXISTS "uso_voucher_insert_policy" ON uso_voucher;
DROP POLICY IF EXISTS "uso_voucher_select_policy" ON uso_voucher;

-- Enable RLS
ALTER TABLE uso_voucher ENABLE ROW LEVEL SECURITY;

-- Create unified insert policy with proper validation
CREATE POLICY "uso_voucher_insert_policy" ON uso_voucher
    FOR INSERT TO authenticated
    WITH CHECK (
        -- Verificar se o voucher já foi usado para este tipo de refeição
        NOT EXISTS (
            SELECT 1 FROM uso_voucher uv
            WHERE uv.usuario_id = NEW.usuario_id
            AND uv.tipo_refeicao_id = NEW.tipo_refeicao_id
            AND DATE(uv.usado_em) = CURRENT_DATE
        )
        AND
        -- Verificar limite de 2 refeições por turno
        (
            SELECT COUNT(*)
            FROM uso_voucher uv
            JOIN usuarios u ON u.id = NEW.usuario_id
            WHERE uv.usuario_id = NEW.usuario_id
            AND u.turno_id = (SELECT turno_id FROM usuarios WHERE id = NEW.usuario_id)
            AND DATE(uv.usado_em) = CURRENT_DATE
        ) < 2
        AND
        -- Verificar se está dentro do horário permitido
        EXISTS (
            SELECT 1 FROM usuarios u
            JOIN turnos t ON t.id = u.turno_id
            JOIN tipos_refeicao tr ON tr.id = NEW.tipo_refeicao_id
            WHERE u.id = NEW.usuario_id
            AND t.ativo = true
            AND tr.ativo = true
            AND CURRENT_TIME BETWEEN t.horario_inicio AND t.horario_fim
            AND CURRENT_TIME BETWEEN tr.horario_inicio 
                AND tr.horario_fim + (tr.minutos_tolerancia || ' minutes')::INTERVAL
        )
    );

-- Create select policy
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

-- Add helpful comments
COMMENT ON POLICY "uso_voucher_insert_policy" ON uso_voucher IS 
'Controla inserção de registros de uso de vouchers com validações de limite por turno e tipo de refeição';

COMMENT ON POLICY "uso_voucher_select_policy" ON uso_voucher IS 
'Controla visualização do histórico de uso de vouchers';