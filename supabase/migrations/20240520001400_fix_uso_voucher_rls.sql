-- Drop existing policies
DROP POLICY IF EXISTS "uso_voucher_insert_policy" ON uso_voucher;
DROP POLICY IF EXISTS "uso_voucher_select_policy" ON uso_voucher;

-- Enable RLS
ALTER TABLE uso_voucher ENABLE ROW LEVEL SECURITY;

-- Create unified insert policy for all voucher types
CREATE POLICY "uso_voucher_insert_policy" ON uso_voucher AS PERMISSIVE
    FOR INSERT TO authenticated
    WITH CHECK (
        -- Validação para voucher comum
        (
            tipo_voucher = 'comum'
            AND EXISTS (
                SELECT 1 FROM usuarios u
                JOIN turnos t ON t.id = u.turno_id
                JOIN tipos_refeicao tr ON tr.id = tipo_refeicao_id
                WHERE u.id = usuario_id
                AND NOT u.suspenso
                AND EXISTS (
                    SELECT 1 FROM empresas e
                    WHERE e.id = u.empresa_id
                    AND e.ativo = true
                )
                -- Validar turno e horário
                AND t.ativo = true
                AND CURRENT_TIME BETWEEN t.horario_inicio AND t.horario_fim
                -- Validar horário da refeição
                AND tr.ativo = true
                AND CURRENT_TIME BETWEEN tr.horario_inicio 
                    AND (tr.horario_fim + (tr.minutos_tolerancia || ' minutes')::INTERVAL)
                -- Validar limite diário
                AND (
                    SELECT COUNT(*)
                    FROM uso_voucher uv
                    WHERE uv.usuario_id = u.id
                    AND DATE(uv.usado_em) = CURRENT_DATE
                ) < 3
                -- Validar intervalo mínimo
                AND NOT EXISTS (
                    SELECT 1 FROM uso_voucher uv
                    WHERE uv.usuario_id = u.id
                    AND uv.usado_em > CURRENT_TIMESTAMP - INTERVAL '3 hours'
                )
            )
        )
        OR
        -- Validação para voucher descartável
        (
            tipo_voucher = 'descartavel'
            AND voucher_descartavel_id IS NOT NULL
            AND EXISTS (
                SELECT 1 FROM vouchers_descartaveis vd
                JOIN tipos_refeicao tr ON tr.id = vd.tipo_refeicao_id
                WHERE vd.id = voucher_descartavel_id
                AND vd.usado_em IS NULL
                AND CURRENT_DATE <= vd.data_expiracao::date
                AND tr.ativo = true
                AND CURRENT_TIME BETWEEN tr.horario_inicio 
                    AND (tr.horario_fim + (tr.minutos_tolerancia || ' minutes')::INTERVAL)
            )
        )
    );

-- Create select policy
CREATE POLICY "uso_voucher_select_policy" ON uso_voucher AS PERMISSIVE
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
'Controla inserção de registros de uso de vouchers com validações específicas por tipo';

COMMENT ON POLICY "uso_voucher_select_policy" ON uso_voucher IS 
'Controla visualização do histórico de uso de vouchers';