-- Drop existing policies
DROP POLICY IF EXISTS "uso_voucher_insert_policy" ON uso_voucher;
DROP POLICY IF EXISTS "uso_voucher_select_policy" ON uso_voucher;

-- Enable RLS
ALTER TABLE uso_voucher ENABLE ROW LEVEL SECURITY;

-- Create unified insert policy
CREATE POLICY "uso_voucher_insert_policy" ON uso_voucher
    FOR INSERT TO authenticated
    WITH CHECK (
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

-- Add comments
COMMENT ON POLICY "uso_voucher_insert_policy" ON uso_voucher 
IS 'Controla inserção de registros de uso de vouchers com validação de horários';

COMMENT ON POLICY "uso_voucher_select_policy" ON uso_voucher 
IS 'Controla visualização do histórico de uso de vouchers';