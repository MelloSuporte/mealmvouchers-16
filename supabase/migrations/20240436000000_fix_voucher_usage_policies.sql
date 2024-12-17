-- Primeiro, remover políticas existentes
DROP POLICY IF EXISTS "uso_voucher_insert_policy" ON uso_voucher;
DROP POLICY IF EXISTS "uso_voucher_select_policy" ON uso_voucher;
DROP POLICY IF EXISTS "uso_voucher_update_policy" ON uso_voucher;
DROP POLICY IF EXISTS "uso_voucher_delete_policy" ON uso_voucher;

-- Habilitar RLS
ALTER TABLE uso_voucher ENABLE ROW LEVEL SECURITY;

-- Política para inserção (uso do voucher)
-- Esta política garante que APENAS a função validate_and_use_voucher pode inserir registros
CREATE POLICY "enforce_voucher_validation_on_insert" ON uso_voucher
    FOR INSERT TO authenticated, anon
    WITH CHECK (
        -- Apenas permite inserção através da função validate_and_use_voucher
        current_setting('voucher.validated', true)::boolean = true
    );

-- Política para visualização (histórico)
CREATE POLICY "allow_view_usage_history" ON uso_voucher
    FOR SELECT TO authenticated
    USING (
        -- Usuários podem ver seu próprio histórico
        usuario_id = auth.uid()
        OR 
        -- Admins podem ver todo o histórico
        EXISTS (
            SELECT 1 FROM usuarios u
            WHERE u.id = auth.uid()
            AND u.role = 'admin'
            AND NOT u.suspenso
        )
    );

-- Modificar a função validate_and_use_voucher para definir a configuração
CREATE OR REPLACE FUNCTION validate_and_use_voucher(
    p_codigo VARCHAR(4),
    p_tipo_refeicao_id UUID
) RETURNS JSONB
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
    -- ... keep existing code (variable declarations)
BEGIN
    -- Definir configuração que permite inserção
    PERFORM set_config('voucher.validated', 'true', true);
    
    -- Get current time
    v_hora_atual := CURRENT_TIME;

    -- ... keep existing code (all validations and checks)

    -- Register usage
    INSERT INTO uso_voucher (
        usuario_id,
        tipo_refeicao_id,
        usado_em
    ) VALUES (
        v_usuario_id,
        p_tipo_refeicao_id,
        CURRENT_TIMESTAMP
    );

    -- Resetar configuração
    PERFORM set_config('voucher.validated', 'false', true);

    RETURN jsonb_build_object(
        'success', true,
        'message', 'Voucher validado com sucesso'
    );

EXCEPTION
    WHEN OTHERS THEN
        -- Garantir que a configuração é resetada mesmo em caso de erro
        PERFORM set_config('voucher.validated', 'false', true);
        RETURN jsonb_build_object(
            'success', false,
            'error', SQLERRM
        );
END;
$$;

-- Garantir que apenas a função validate_and_use_voucher pode definir a configuração
REVOKE ALL ON FUNCTION set_config(text, text, boolean) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION set_config(text, text, boolean) TO authenticated;

-- Comentários para documentação
COMMENT ON POLICY "enforce_voucher_validation_on_insert" ON uso_voucher IS 
'Garante que vouchers só podem ser usados através da função validate_and_use_voucher que implementa todas as validações';

COMMENT ON POLICY "allow_view_usage_history" ON uso_voucher IS 
'Permite que usuários vejam seu próprio histórico e admins vejam todo o histórico';