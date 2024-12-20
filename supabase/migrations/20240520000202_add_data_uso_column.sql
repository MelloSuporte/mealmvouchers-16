-- Primeiro dropar a view que depende da coluna
DROP VIEW IF EXISTS vouchers_extras_view;

-- Remover a coluna se ela existir (para evitar conflitos de tipo)
DO $$ 
BEGIN
    IF EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'vouchers_extras' 
        AND column_name = 'data_uso'
    ) THEN
        ALTER TABLE vouchers_extras DROP COLUMN data_uso;
    END IF;
END $$;

-- Adicionar a coluna com o tipo correto
ALTER TABLE vouchers_extras 
ADD COLUMN data_uso TIMESTAMP WITH TIME ZONE;

-- Adicionar comentário explicativo
COMMENT ON COLUMN vouchers_extras.data_uso IS 'Data e hora em que o voucher extra foi utilizado';

-- Atualizar registros existentes usando o nome correto da coluna
UPDATE vouchers_extras 
SET data_uso = usado_em 
WHERE usado_em IS NOT NULL AND data_uso IS NULL;

-- Recriar a view com a nova coluna
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
    CASE 
        WHEN ve.usado_em IS NOT NULL THEN true 
        ELSE false 
    END as usado,
    ve.usado_em,
    ve.data_uso,
    ve.observacao,
    ve.criado_em,
    u.nome as usuario_nome,
    tr.nome as tipo_refeicao_nome
FROM vouchers_extras ve
LEFT JOIN usuarios u ON ve.usuario_id = u.id
LEFT JOIN tipos_refeicao tr ON ve.tipo_refeicao_id = tr.id;

-- Restaurar as permissões da view
ALTER VIEW vouchers_extras_view OWNER TO postgres;
GRANT SELECT ON vouchers_extras_view TO authenticated;
GRANT SELECT ON vouchers_extras_view TO anon;