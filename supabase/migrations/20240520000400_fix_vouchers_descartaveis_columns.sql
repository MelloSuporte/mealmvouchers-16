-- Drop existing policies
DROP POLICY IF EXISTS "vouchers_descartaveis_select_policy" ON vouchers_descartaveis;
DROP POLICY IF EXISTS "vouchers_descartaveis_update_policy" ON vouchers_descartaveis;

-- Ensure usado_em column exists with correct type
DO $$ 
BEGIN
    -- Drop usado column if it exists
    IF EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'vouchers_descartaveis' 
        AND column_name = 'usado'
    ) THEN
        ALTER TABLE vouchers_descartaveis DROP COLUMN usado;
    END IF;

    -- Add usado_em column if it doesn't exist
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'vouchers_descartaveis' 
        AND column_name = 'usado_em'
    ) THEN
        ALTER TABLE vouchers_descartaveis 
        ADD COLUMN usado_em TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

-- Update policies to use usado_em
CREATE POLICY "vouchers_descartaveis_select_policy" ON vouchers_descartaveis
    FOR SELECT
    USING (
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
    );

CREATE POLICY "vouchers_descartaveis_update_policy" ON vouchers_descartaveis
    FOR UPDATE
    USING (
        usado_em IS NULL 
        AND CURRENT_DATE <= data_expiracao::date
        AND EXISTS (
            SELECT 1 FROM tipos_refeicao tr
            WHERE tr.id = tipo_refeicao_id
            AND tr.ativo = true
            AND CURRENT_TIME BETWEEN tr.horario_inicio 
            AND (tr.horario_fim + (tr.minutos_tolerancia || ' minutes')::INTERVAL)
        )
    )
    WITH CHECK (
        usado_em IS NOT NULL
        AND NEW.id = OLD.id
        AND NEW.tipo_refeicao_id = OLD.tipo_refeicao_id
        AND NEW.codigo = OLD.codigo
        AND NEW.data_expiracao = OLD.data_expiracao
    );

-- Add helpful comments
COMMENT ON COLUMN vouchers_descartaveis.usado_em IS 'Data e hora em que o voucher foi utilizado';