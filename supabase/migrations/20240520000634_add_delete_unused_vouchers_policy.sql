-- Drop existing delete policy if exists
DROP POLICY IF EXISTS "vouchers_descartaveis_delete_policy" ON vouchers_descartaveis;

-- Create new delete policy
CREATE POLICY "vouchers_descartaveis_delete_policy" ON vouchers_descartaveis
    FOR DELETE TO authenticated
    USING (
        -- Permite deletar apenas vouchers não utilizados
        usado_em IS NULL
        AND data_uso IS NULL
    );

-- Add helpful comment
COMMENT ON POLICY "vouchers_descartaveis_delete_policy" ON vouchers_descartaveis IS 
'Permite deletar apenas vouchers que não foram utilizados';

-- Grant delete permission
GRANT DELETE ON vouchers_descartaveis TO authenticated;