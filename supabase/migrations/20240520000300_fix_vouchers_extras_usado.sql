-- Drop existing policies
DROP POLICY IF EXISTS "vouchers_extras_select_policy" ON vouchers_extras;
DROP POLICY IF EXISTS "vouchers_extras_update_policy" ON vouchers_extras;

-- Create new policies using usado_em instead of usado
CREATE POLICY "vouchers_extras_select_policy" ON vouchers_extras
    FOR SELECT TO authenticated
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

CREATE POLICY "vouchers_extras_update_policy" ON vouchers_extras
    FOR UPDATE TO authenticated
    USING (
        usuario_id = auth.uid()
        AND usado_em IS NULL
    )
    WITH CHECK (
        usuario_id = auth.uid()
        AND usado_em IS NULL
    );

-- Update view to use usado_em
DROP VIEW IF EXISTS vouchers_extras_view;

CREATE OR REPLACE VIEW vouchers_extras_view
WITH (security_barrier = true, security_invoker = true)
AS
SELECT 
    ve.id,
    ve.usuario_id,
    ve.tipo_refeicao_id,
    ve.autorizado_por,
    ve.codigo,
    ve.valido_ate,
    ve.usado_em IS NOT NULL as usado,
    ve.usado_em,
    ve.observacao,
    ve.criado_em,
    u.nome as usuario_nome,
    tr.nome as tipo_refeicao_nome
FROM vouchers_extras ve
LEFT JOIN usuarios u ON ve.usuario_id = u.id
LEFT JOIN tipos_refeicao tr ON ve.tipo_refeicao_id = tr.id;

-- Set permissions
ALTER VIEW vouchers_extras_view OWNER TO postgres;
GRANT SELECT ON vouchers_extras_view TO authenticated;
GRANT SELECT ON vouchers_extras_view TO anon;