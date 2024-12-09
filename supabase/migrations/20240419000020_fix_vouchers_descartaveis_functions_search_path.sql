-- Atualizar função update_vouchers_descartaveis_updated_at com search_path fixo
CREATE OR REPLACE FUNCTION update_vouchers_descartaveis_updated_at()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.atualizado_em = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;

-- Atualizar função check_voucher_descartavel_validade com search_path fixo
CREATE OR REPLACE FUNCTION check_voucher_descartavel_validade()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
    IF NEW.validade <= CURRENT_DATE THEN
        NEW.status = 'expirado';
    END IF;
    RETURN NEW;
END;
$$;

-- Configurar permissões das funções
ALTER FUNCTION update_vouchers_descartaveis_updated_at() OWNER TO postgres;
ALTER FUNCTION check_voucher_descartavel_validade() OWNER TO postgres;

REVOKE ALL ON FUNCTION update_vouchers_descartaveis_updated_at() FROM PUBLIC;
REVOKE ALL ON FUNCTION check_voucher_descartavel_validade() FROM PUBLIC;

GRANT EXECUTE ON FUNCTION update_vouchers_descartaveis_updated_at() TO authenticated;
GRANT EXECUTE ON FUNCTION check_voucher_descartavel_validade() TO authenticated;

-- Recriar triggers com as funções atualizadas
DROP TRIGGER IF EXISTS update_vouchers_descartaveis_updated_at_trigger ON vouchers_descartaveis;
CREATE TRIGGER update_vouchers_descartaveis_updated_at_trigger
    BEFORE UPDATE ON vouchers_descartaveis
    FOR EACH ROW
    EXECUTE FUNCTION update_vouchers_descartaveis_updated_at();

DROP TRIGGER IF EXISTS check_voucher_descartavel_validade_trigger ON vouchers_descartaveis;
CREATE TRIGGER check_voucher_descartavel_validade_trigger
    BEFORE INSERT OR UPDATE ON vouchers_descartaveis
    FOR EACH ROW
    EXECUTE FUNCTION check_voucher_descartavel_validade();

-- Adicionar comentários explicativos
COMMENT ON FUNCTION update_vouchers_descartaveis_updated_at() IS 'Atualiza o timestamp de atualização automaticamente';
COMMENT ON FUNCTION check_voucher_descartavel_validade() IS 'Verifica e atualiza o status do voucher baseado na validade';

-- Adicionar comentários nos triggers
COMMENT ON TRIGGER update_vouchers_descartaveis_updated_at_trigger ON vouchers_descartaveis IS 'Trigger para atualizar timestamp de atualização';
COMMENT ON TRIGGER check_voucher_descartavel_validade_trigger ON vouchers_descartaveis IS 'Trigger para verificar validade do voucher';
