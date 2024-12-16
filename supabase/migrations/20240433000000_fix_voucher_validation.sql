-- Drop old policies if they exist
DROP POLICY IF EXISTS "vouchers_comuns_select_policy" ON usuarios;
DROP POLICY IF EXISTS "vouchers_extras_select_policy" ON usuarios;
DROP POLICY IF EXISTS "vouchers_descartaveis_select_policy" ON usuarios;

-- Enable RLS
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE uso_voucher ENABLE ROW LEVEL SECURITY;

-- Create base policies
CREATE POLICY "allow_voucher_validation_by_code" ON usuarios
    FOR SELECT 
    USING (true);

CREATE POLICY "allow_system_voucher_update" ON usuarios
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM usuarios u
            WHERE u.id = auth.uid()
            AND u.role = 'system'
        )
    );

-- Create usage policies
CREATE POLICY "allow_voucher_usage_registration" ON uso_voucher
    FOR INSERT
    WITH CHECK (true);

CREATE POLICY "allow_view_usage_history" ON uso_voucher
    FOR SELECT
    USING (
        usuario_id = auth.uid()
        OR 
        EXISTS (
            SELECT 1 FROM usuarios u
            WHERE u.id = auth.uid()
            AND u.role IN ('admin', 'gestor')
            AND NOT u.suspenso
        )
    );

-- Create validation functions
CREATE OR REPLACE FUNCTION check_meal_time_and_shift(
    p_tipo_refeicao_id UUID,
    p_turno_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
    v_current_time TIME;
    v_is_valid BOOLEAN;
BEGIN
    v_current_time := CURRENT_TIME;
    
    SELECT EXISTS (
        SELECT 1 
        FROM tipos_refeicao tr
        JOIN turnos t ON true
        WHERE tr.id = p_tipo_refeicao_id
        AND t.id = p_turno_id
        AND tr.ativo = true
        AND t.ativo = true
        AND v_current_time BETWEEN tr.horario_inicio 
        AND (tr.horario_fim + (tr.minutos_tolerancia || ' minutes')::INTERVAL)
    ) INTO v_is_valid;
    
    RETURN v_is_valid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION check_meal_time_and_shift TO anon;
GRANT EXECUTE ON FUNCTION validate_and_use_voucher TO anon;

GRANT SELECT ON usuarios TO anon;
GRANT SELECT ON tipos_refeicao TO anon;
GRANT SELECT ON turnos TO anon;
GRANT SELECT ON empresas TO anon;
GRANT INSERT ON uso_voucher TO anon;