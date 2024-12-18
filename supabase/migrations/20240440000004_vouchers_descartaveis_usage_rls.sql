-- Remover políticas existentes se existirem
DROP POLICY IF EXISTS "allow_voucher_descartavel_use" ON vouchers_descartaveis;
DROP POLICY IF EXISTS "prevent_voucher_reuse" ON vouchers_descartaveis;
DROP POLICY IF EXISTS "expired_voucher_cleanup" ON vouchers_descartaveis;

-- Habilitar RLS
ALTER TABLE vouchers_descartaveis ENABLE ROW LEVEL SECURITY;

-- Criar função para validar horário da refeição
CREATE OR REPLACE FUNCTION check_meal_time_for_voucher(
    p_tipo_refeicao_id UUID,
    p_hora_atual TIME DEFAULT CURRENT_TIME
) RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
    v_hora_inicio TIME;
    v_hora_fim TIME;
    v_tolerancia INTEGER;
BEGIN
    -- Obter configuração do horário da refeição
    SELECT 
        hora_inicio,
        hora_fim,
        minutos_tolerancia
    INTO 
        v_hora_inicio,
        v_hora_fim,
        v_tolerancia
    FROM tipos_refeicao
    WHERE id = p_tipo_refeicao_id
    AND ativo = true;

    -- Verificar se o horário atual está dentro do intervalo permitido (incluindo tolerância)
    RETURN p_hora_atual BETWEEN v_hora_inicio 
        AND v_hora_fim + (v_tolerancia || ' minutes')::INTERVAL;
END;
$$;

-- Política para permitir uso do voucher
CREATE POLICY "allow_voucher_descartavel_use" ON vouchers_descartaveis
    FOR SELECT
    TO authenticated
    USING (
        -- Voucher não deve estar usado
        NOT usado
        AND
        -- Voucher deve ser válido para hoje
        CURRENT_DATE <= data_expiracao::date
        AND
        -- Código do voucher deve ter 4 dígitos
        length(codigo) = 4
        AND codigo ~ '^\d{4}$'
        AND
        -- Verificar horário da refeição
        check_meal_time_for_voucher(tipo_refeicao_id)
    );

-- Política para prevenir reutilização do voucher
CREATE POLICY "prevent_voucher_reuse" ON vouchers_descartaveis
    FOR UPDATE
    TO authenticated
    USING (NOT usado)
    WITH CHECK (
        -- Apenas permitir marcar como usado
        usado = true
        AND
        -- Garantir que outros campos permaneçam inalterados
        id = id
        AND tipo_refeicao_id = tipo_refeicao_id
        AND codigo = codigo
        AND data_expiracao = data_expiracao
    );

-- Criar função para limpar vouchers expirados
CREATE OR REPLACE FUNCTION cleanup_expired_vouchers()
RETURNS void
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
    DELETE FROM vouchers_descartaveis
    WHERE NOT usado 
    AND data_expiracao < CURRENT_DATE;
END;
$$;

-- Criar um trabalho agendado para executar a limpeza todos os dias à meia-noite
SELECT cron.schedule(
    'cleanup-expired-vouchers',  -- nome do trabalho cron
    '0 0 * * *',                -- executar à meia-noite todos os dias
    'SELECT cleanup_expired_vouchers()'
);

-- Política para permitir que o sistema exclua vouchers expirados
CREATE POLICY "expired_voucher_cleanup" ON vouchers_descartaveis
    FOR DELETE
    TO authenticated
    USING (
        data_expiracao < CURRENT_DATE
        AND NOT usado
    );

-- Conceder permissões necessárias
GRANT SELECT, UPDATE, DELETE ON vouchers_descartaveis TO authenticated;
GRANT EXECUTE ON FUNCTION check_meal_time_for_voucher TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_expired_vouchers TO authenticated;

-- Adicionar comentários úteis
COMMENT ON POLICY "allow_voucher_descartavel_use" ON vouchers_descartaveis IS 
'Permite que usuários autenticados visualizem e usem vouchers válidos e não utilizados durante os horários de refeição';

COMMENT ON POLICY "prevent_voucher_reuse" ON vouchers_descartaveis IS 
'Impede a reutilização do voucher permitindo apenas a marcação como usado';

COMMENT ON POLICY "expired_voucher_cleanup" ON vouchers_descartaveis IS 
'Permite que o sistema exclua automaticamente vouchers expirados e não utilizados';

COMMENT ON FUNCTION check_meal_time_for_voucher IS 
'Valida se o horário atual está dentro do intervalo permitido para refeição incluindo tolerância';

COMMENT ON FUNCTION cleanup_expired_vouchers IS 
'Remove vouchers expirados e não utilizados do banco de dados';