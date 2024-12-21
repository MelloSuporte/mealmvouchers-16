-- Drop existing policies
DROP POLICY IF EXISTS "vouchers_descartaveis_select_policy" ON vouchers_descartaveis;
DROP POLICY IF EXISTS "vouchers_descartaveis_update_policy" ON vouchers_descartaveis;

-- Enable RLS
ALTER TABLE vouchers_descartaveis ENABLE ROW LEVEL SECURITY;

-- Create select policy with proper validation
CREATE POLICY "vouchers_descartaveis_select_policy" ON vouchers_descartaveis AS RESTRICTIVE
    FOR SELECT TO authenticated, anon
    USING (
        -- Voucher não usado e dentro da validade
        usado_em IS NULL 
        AND data_uso IS NULL
        AND CURRENT_DATE <= data_expiracao::date
        AND codigo IS NOT NULL
        -- Verificar tipo de refeição e horário
        AND EXISTS (
            SELECT 1 FROM tipos_refeicao tr
            WHERE tr.id = tipo_refeicao_id
            AND tr.ativo = true
            AND CURRENT_TIME BETWEEN tr.horario_inicio 
            AND (tr.horario_fim + (tr.minutos_tolerancia || ' minutes')::INTERVAL)
        )
        -- Garantir que não existe uso anterior
        AND NOT EXISTS (
            SELECT 1 FROM uso_voucher uv
            WHERE uv.voucher_descartavel_id = vouchers_descartaveis.id
        )
    );

-- Create update policy with proper validation
CREATE POLICY "vouchers_descartaveis_update_policy" ON vouchers_descartaveis AS RESTRICTIVE
    FOR UPDATE TO authenticated, anon
    USING (
        -- Voucher não usado e dentro da validade
        usado_em IS NULL 
        AND data_uso IS NULL
        AND CURRENT_DATE <= data_expiracao::date
        -- Verificar tipo de refeição e horário
        AND EXISTS (
            SELECT 1 FROM tipos_refeicao tr
            WHERE tr.id = tipo_refeicao_id
            AND tr.ativo = true
            AND CURRENT_TIME BETWEEN tr.horario_inicio 
            AND (tr.horario_fim + (tr.minutos_tolerancia || ' minutes')::INTERVAL)
        )
        -- Garantir que não existe uso anterior
        AND NOT EXISTS (
            SELECT 1 FROM uso_voucher uv
            WHERE uv.voucher_descartavel_id = vouchers_descartaveis.id
        )
    )
    WITH CHECK (
        usado_em IS NOT NULL
        AND data_uso IS NOT NULL
    );

-- Create trigger function to prevent multiple uses
CREATE OR REPLACE FUNCTION prevent_voucher_reuse()
RETURNS TRIGGER AS $$
BEGIN
    -- Verificar se já existe um uso registrado
    IF EXISTS (
        SELECT 1 FROM uso_voucher
        WHERE voucher_descartavel_id = NEW.id
    ) THEN
        RAISE EXCEPTION 'Este voucher já foi utilizado';
    END IF;

    -- Verificar tipo de refeição e horário
    IF NOT EXISTS (
        SELECT 1 FROM tipos_refeicao tr
        WHERE tr.id = NEW.tipo_refeicao_id
        AND tr.ativo = true
        AND CURRENT_TIME BETWEEN tr.horario_inicio 
        AND (tr.horario_fim + (tr.minutos_tolerancia || ' minutes')::INTERVAL)
    ) THEN
        RAISE EXCEPTION 'Tipo de refeição inválido ou fora do horário permitido';
    END IF;

    -- Registrar o uso do voucher
    INSERT INTO uso_voucher (
        voucher_descartavel_id,
        tipo_refeicao_id,
        usado_em
    ) VALUES (
        NEW.id,
        NEW.tipo_refeicao_id,
        CURRENT_TIMESTAMP
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS prevent_voucher_reuse_trigger ON vouchers_descartaveis;
CREATE TRIGGER prevent_voucher_reuse_trigger
    BEFORE UPDATE ON vouchers_descartaveis
    FOR EACH ROW
    WHEN (OLD.usado_em IS NULL AND NEW.usado_em IS NOT NULL)
    EXECUTE FUNCTION prevent_voucher_reuse();

-- Grant necessary permissions
GRANT SELECT, UPDATE ON vouchers_descartaveis TO anon;
GRANT SELECT ON tipos_refeicao TO anon;
GRANT INSERT ON uso_voucher TO anon;

-- Add helpful comments
COMMENT ON POLICY "vouchers_descartaveis_select_policy" ON vouchers_descartaveis IS 
'Permite visualizar apenas vouchers válidos, não utilizados e dentro do horário permitido';

COMMENT ON POLICY "vouchers_descartaveis_update_policy" ON vouchers_descartaveis IS 
'Permite apenas marcar vouchers como usados quando dentro do horário permitido';

COMMENT ON FUNCTION prevent_voucher_reuse IS 
'Impede o uso múltiplo de vouchers e valida o tipo de refeição';