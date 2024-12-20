-- Drop existing view
DROP VIEW IF EXISTS vw_uso_voucher_detalhado;

-- Recreate view with SECURITY INVOKER
CREATE VIEW vw_uso_voucher_detalhado
WITH (security_barrier = true, security_invoker = true)
AS
SELECT 
    uv.id,
    uv.usado_em as data_uso,
    u.id as usuario_id,
    u.nome as nome_usuario,
    u.cpf,
    e.id as empresa_id,
    e.nome as nome_empresa,
    t.tipo_turno as turno,
    s.id as setor_id,
    s.nome_setor,
    tr.nome as tipo_refeicao,
    tr.valor as valor_refeicao,
    uv.observacao
FROM uso_voucher uv
LEFT JOIN usuarios u ON uv.usuario_id = u.id
LEFT JOIN empresas e ON u.empresa_id = e.id
LEFT JOIN turnos t ON u.turno_id = t.id
LEFT JOIN setores s ON u.setor_id = s.id
LEFT JOIN tipos_refeicao tr ON uv.tipo_refeicao_id = tr.id;

-- Set permissions
ALTER VIEW vw_uso_voucher_detalhado OWNER TO postgres;
GRANT ALL ON vw_uso_voucher_detalhado TO authenticated;

-- Drop existing policies
DROP POLICY IF EXISTS "uso_voucher_select_policy" ON uso_voucher;
DROP POLICY IF EXISTS "uso_voucher_insert_policy" ON uso_voucher;
DROP POLICY IF EXISTS "uso_voucher_update_policy" ON uso_voucher;
DROP POLICY IF EXISTS "uso_voucher_delete_policy" ON uso_voucher;

-- Enable RLS
ALTER TABLE uso_voucher ENABLE ROW LEVEL SECURITY;

-- Create new policies with full access for all authenticated users
CREATE POLICY "uso_voucher_select_policy" ON uso_voucher
    FOR SELECT TO authenticated
    USING (true);

CREATE POLICY "uso_voucher_insert_policy" ON uso_voucher
    FOR INSERT TO authenticated
    WITH CHECK (true);

CREATE POLICY "uso_voucher_update_policy" ON uso_voucher
    FOR UPDATE TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "uso_voucher_delete_policy" ON uso_voucher
    FOR DELETE TO authenticated
    USING (true);

-- Grant necessary permissions
GRANT ALL ON uso_voucher TO authenticated;

-- Add comments
COMMENT ON VIEW vw_uso_voucher_detalhado IS 'View detalhada do uso de vouchers com acesso total para usuários autenticados';