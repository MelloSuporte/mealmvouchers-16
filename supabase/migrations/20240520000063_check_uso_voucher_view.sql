-- Verificar se a view existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_views
        WHERE viewname = 'vw_uso_voucher_detalhado'
    ) THEN
        RAISE NOTICE 'View vw_uso_voucher_detalhado não existe!';
    ELSE
        RAISE NOTICE 'View vw_uso_voucher_detalhado existe!';
    END IF;
END
$$;

-- Mostrar a definição da view se ela existir
SELECT pg_get_viewdef('vw_uso_voucher_detalhado'::regclass);

-- Mostrar as colunas da view
SELECT 
    column_name,
    data_type,
    character_maximum_length
FROM information_schema.columns
WHERE table_name = 'vw_uso_voucher_detalhado'
ORDER BY ordinal_position;

-- Verificar permissões da view
SELECT 
    grantee, 
    privilege_type
FROM information_schema.role_table_grants
WHERE table_name = 'vw_uso_voucher_detalhado';

-- Verificar se existem registros na view
SELECT COUNT(*) FROM vw_uso_voucher_detalhado;

-- Mostrar alguns registros de exemplo (limitado a 5)
SELECT * FROM vw_uso_voucher_detalhado
LIMIT 5;