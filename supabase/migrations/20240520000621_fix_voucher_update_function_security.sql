/* Drop existing trigger first */
DROP TRIGGER IF EXISTS validate_voucher_update_trigger ON vouchers_descartaveis;

/* Drop existing function */
DROP FUNCTION IF EXISTS validate_voucher_update();

/* Recreate function with proper security settings */
CREATE OR REPLACE FUNCTION validate_voucher_update()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
    /* Verificar se o voucher já foi usado */
    IF EXISTS (
        SELECT 1 FROM vouchers_descartaveis
        WHERE id = NEW.id
        AND (usado_em IS NOT NULL OR data_uso IS NOT NULL)
    ) THEN
        RAISE EXCEPTION 'Este voucher já foi utilizado';
    END IF;

    /* Verificar se está sendo marcado como usado corretamente */
    IF NEW.usado_em IS NULL OR NEW.data_uso IS NULL THEN
        RAISE EXCEPTION 'O voucher deve ser marcado com data de uso';
    END IF;

    /* Verificar se o tipo de refeição está ativo e dentro do horário */
    IF NOT EXISTS (
        SELECT 1 FROM tipos_refeicao tr
        WHERE tr.id = NEW.tipo_refeicao_id
        AND tr.ativo = true
        AND CURRENT_TIME BETWEEN tr.horario_inicio 
        AND (tr.horario_fim + (tr.minutos_tolerancia || ' minutes')::INTERVAL)
    ) THEN
        RAISE EXCEPTION 'Tipo de refeição inválido ou fora do horário permitido';
    END IF;

    RETURN NEW;
END;
$$;

/* Recreate trigger */
CREATE TRIGGER validate_voucher_update_trigger
    BEFORE UPDATE ON vouchers_descartaveis
    FOR EACH ROW
    EXECUTE FUNCTION validate_voucher_update();

/* Set proper function ownership and permissions */
ALTER FUNCTION validate_voucher_update() OWNER TO postgres;
REVOKE ALL ON FUNCTION validate_voucher_update() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION validate_voucher_update() TO authenticated;

/* Add helpful comment */
COMMENT ON FUNCTION validate_voucher_update() IS 
'Função que valida a atualização de vouchers com configurações de segurança apropriadas';