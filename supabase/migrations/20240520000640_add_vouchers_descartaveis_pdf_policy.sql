/* Remover política existente se houver */
DROP POLICY IF EXISTS "vouchers_descartaveis_pdf_policy" ON vouchers_descartaveis;

/* Criar política para visualização de vouchers ativos e download de PDF */
CREATE POLICY "vouchers_descartaveis_pdf_policy" ON vouchers_descartaveis
    FOR SELECT TO authenticated, anon
    USING (
        /* Voucher não usado e dentro da validade */
        (
            usado_em IS NULL 
            AND CURRENT_DATE <= data_expiracao::date
            AND codigo IS NOT NULL
            AND EXISTS (
                SELECT 1 FROM tipos_refeicao tr
                WHERE tr.id = tipo_refeicao_id
                AND tr.ativo = true
                AND CURRENT_TIME BETWEEN tr.horario_inicio 
                AND (tr.horario_fim + (tr.minutos_tolerancia || ' minutes')::INTERVAL)
            )
        )
        OR 
        /* Admins e gestores podem ver todos os vouchers */
        (
            EXISTS (
                SELECT 1 FROM usuarios u
                WHERE u.id = auth.uid()
                AND u.role IN ('admin', 'gestor')
                AND NOT u.suspenso
            )
        )
    );

/* Conceder permissões necessárias */
GRANT SELECT ON vouchers_descartaveis TO anon;
GRANT SELECT ON tipos_refeicao TO anon;
GRANT USAGE ON SCHEMA public TO anon;

/* Adicionar comentário explicativo */
COMMENT ON POLICY "vouchers_descartaveis_pdf_policy" ON vouchers_descartaveis IS 
'Permite visualizar vouchers ativos e baixar PDF para usuários anônimos e autenticados';