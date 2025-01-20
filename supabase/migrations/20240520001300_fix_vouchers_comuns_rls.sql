-- Drop existing policies
DROP POLICY IF EXISTS "vouchers_comuns_select_policy" ON vouchers_comuns;
DROP POLICY IF EXISTS "vouchers_comuns_insert_policy" ON vouchers_comuns;
DROP POLICY IF EXISTS "vouchers_comuns_update_policy" ON vouchers_comuns;
DROP POLICY IF EXISTS "uso_voucher_insert_policy" ON uso_voucher;
DROP POLICY IF EXISTS "uso_voucher_select_policy" ON uso_voucher;

-- Enable RLS
ALTER TABLE vouchers_comuns ENABLE ROW LEVEL SECURITY;
ALTER TABLE uso_voucher ENABLE ROW LEVEL SECURITY;

-- Create select policy for vouchers_comuns
CREATE POLICY "vouchers_comuns_select_policy" ON vouchers_comuns
    FOR SELECT TO authenticated, anon
    USING (
        -- Voucher não usado
        NOT EXISTS (
            SELECT 1 FROM uso_voucher uv
            WHERE uv.usuario_id = vouchers_comuns.usuario_id
            AND uv.tipo_refeicao_id = vouchers_comuns.tipo_refeicao_id
            AND DATE(uv.usado_em) = CURRENT_DATE
        )
        -- Validar turno do usuário
        AND EXISTS (
            SELECT 1 FROM usuarios u
            JOIN turnos t ON u.turno_id = t.id
            WHERE u.id = vouchers_comuns.usuario_id
            AND t.ativo = true
            AND CURRENT_TIME BETWEEN t.horario_inicio AND t.horario_fim
        )
        -- Validar horário da refeição
        AND EXISTS (
            SELECT 1 FROM tipos_refeicao tr
            WHERE tr.id = vouchers_comuns.tipo_refeicao_id
            AND tr.ativo = true
            AND CURRENT_TIME BETWEEN tr.horario_inicio 
                AND (tr.horario_fim + (tr.minutos_tolerancia || ' minutes')::INTERVAL)
        )
        -- Validar limite diário
        AND (
            SELECT COUNT(*)
            FROM uso_voucher uv
            WHERE uv.usuario_id = vouchers_comuns.usuario_id
            AND DATE(uv.usado_em) = CURRENT_DATE
        ) < 3
    );

-- Create insert policy for uso_voucher
CREATE POLICY "uso_voucher_insert_policy" ON uso_voucher
    FOR INSERT TO authenticated, anon
    WITH CHECK (
        -- Validar voucher comum
        EXISTS (
            SELECT 1 FROM vouchers_comuns vc
            WHERE vc.usuario_id = NEW.usuario_id
            AND vc.tipo_refeicao_id = NEW.tipo_refeicao_id
            -- Validar turno
            AND EXISTS (
                SELECT 1 FROM usuarios u
                JOIN turnos t ON u.turno_id = t.id
                WHERE u.id = vc.usuario_id
                AND t.ativo = true
                AND CURRENT_TIME BETWEEN t.horario_inicio AND t.horario_fim
            )
            -- Validar horário refeição
            AND EXISTS (
                SELECT 1 FROM tipos_refeicao tr
                WHERE tr.id = vc.tipo_refeicao_id
                AND tr.ativo = true
                AND CURRENT_TIME BETWEEN tr.horario_inicio 
                    AND (tr.horario_fim + (tr.minutos_tolerancia || ' minutes')::INTERVAL)
            )
            -- Validar limite diário
            AND (
                SELECT COUNT(*)
                FROM uso_voucher uv
                WHERE uv.usuario_id = NEW.usuario_id
                AND DATE(uv.usado_em) = CURRENT_DATE
            ) < 3
            -- Validar intervalo entre refeições
            AND NOT EXISTS (
                SELECT 1 FROM uso_voucher uv
                WHERE uv.usuario_id = NEW.usuario_id
                AND uv.usado_em > (CURRENT_TIMESTAMP - INTERVAL '3 hours')
            )
        )
    );

-- Create select policy for uso_voucher
CREATE POLICY "uso_voucher_select_policy" ON uso_voucher
    FOR SELECT TO authenticated, anon
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

-- Grant necessary permissions
GRANT SELECT ON vouchers_comuns TO authenticated, anon;
GRANT SELECT, INSERT ON uso_voucher TO authenticated, anon;
GRANT SELECT ON usuarios TO anon;
GRANT SELECT ON turnos TO anon;
GRANT SELECT ON tipos_refeicao TO anon;

-- Add helpful comments
COMMENT ON POLICY "vouchers_comuns_select_policy" ON vouchers_comuns IS 
'Permite visualizar vouchers comuns não usados, dentro do horário do turno e da refeição, respeitando limite diário';

COMMENT ON POLICY "uso_voucher_insert_policy" ON uso_voucher IS 
'Controla inserção de registros de uso de vouchers com todas as validações necessárias';

COMMENT ON POLICY "uso_voucher_select_policy" ON uso_voucher IS 
'Permite visualização do histórico de uso de vouchers';