-- Drop existing policies
DROP POLICY IF EXISTS "uso_voucher_insert_policy" ON uso_voucher;
DROP POLICY IF EXISTS "uso_voucher_select_policy" ON uso_voucher;

-- Enable RLS
ALTER TABLE uso_voucher ENABLE ROW LEVEL SECURITY;

-- Create unified insert policy with complete validation
CREATE POLICY "uso_voucher_insert_policy" ON uso_voucher
    FOR INSERT TO authenticated, anon
    WITH CHECK (
        -- Validate user, shift, meal type and company
        EXISTS (
            SELECT 1
            FROM usuarios u
            JOIN turnos t ON t.id = u.turno_id
            JOIN tipos_refeicao tr ON tr.id = tipo_refeicao_id
            WHERE u.id = usuario_id 
            AND NOT u.suspenso
            AND t.ativo = true
            AND tr.ativo = true
            -- Check meal type time
            AND CURRENT_TIME BETWEEN tr.horario_inicio 
            AND (tr.horario_fim + (tr.minutos_tolerancia || ' minutes')::INTERVAL)
            -- Check shift time
            AND CURRENT_TIME BETWEEN t.horario_inicio AND t.horario_fim
            -- Check company status
            AND EXISTS (
                SELECT 1 FROM empresas e
                WHERE e.id = u.empresa_id
                AND e.ativo = true
            )
        )
        AND
        -- Check daily limit (max 2 meals per day)
        (
            SELECT COUNT(*) 
            FROM uso_voucher uv
            WHERE uv.usuario_id = usuario_id 
            AND DATE(uv.usado_em) = CURRENT_DATE
        ) < 2
        AND
        -- Check minimum interval (1 hour)
        NOT EXISTS (
            SELECT 1 
            FROM uso_voucher uv
            WHERE uv.usuario_id = usuario_id
            AND uv.usado_em > (CURRENT_TIMESTAMP - INTERVAL '1 hour')
        )
        AND
        -- Validate based on voucher type
        CASE
            -- Disposable voucher validation
            WHEN voucher_descartavel_id IS NOT NULL THEN
                EXISTS (
                    SELECT 1 
                    FROM vouchers_descartaveis vd
                    WHERE vd.id = voucher_descartavel_id
                    AND vd.usado_em IS NULL
                    AND CURRENT_DATE <= vd.data_expiracao::date
                    AND vd.tipo_refeicao_id = tipo_refeicao_id
                )
            -- Common voucher validation
            ELSE
                EXISTS (
                    SELECT 1 
                    FROM usuarios u
                    WHERE u.id = usuario_id
                    AND u.voucher = u.voucher
                    AND NOT EXISTS (
                        SELECT 1 
                        FROM uso_voucher uv
                        WHERE uv.usuario_id = u.id
                        AND DATE(uv.usado_em) = CURRENT_DATE
                        AND uv.tipo_refeicao_id = tipo_refeicao_id
                    )
                )
        END
    );

-- Create select policy
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
        OR
        voucher_descartavel_id IS NOT NULL
    );

-- Grant necessary permissions
GRANT SELECT, INSERT ON uso_voucher TO authenticated;
GRANT SELECT, INSERT ON uso_voucher TO anon;

-- Add helpful comments
COMMENT ON POLICY "uso_voucher_insert_policy" ON uso_voucher IS 
'Controla inserção de registros de uso de vouchers com validações completas de horário, turno e limites de uso';

COMMENT ON POLICY "uso_voucher_select_policy" ON uso_voucher IS 
'Controla visualização do histórico de uso de vouchers';