# Políticas de Validação de Vouchers

## Validação por Código
- Vouchers são validados pelo código de 4 dígitos
- Não requer autenticação do usuário final
- Apenas sistema pode registrar uso

## Políticas RLS

```sql
-- Política para validação de voucher comum
CREATE POLICY "voucher_comum_validation_policy" ON vouchers_comuns
    FOR SELECT
    USING (
        -- Permite consulta pelo código do voucher sem autenticação
        TRUE
    );

-- Política para registro de uso
CREATE POLICY "uso_voucher_insert_policy" ON uso_voucher
    FOR INSERT
    WITH CHECK (
        -- Apenas o sistema pode registrar uso
        (SELECT TRUE FROM system_auth WHERE role = 'system')
        AND
        CASE 
            WHEN NEW.voucher_extra_id IS NOT NULL THEN
                validate_extra_voucher(NEW.codigo_voucher)
            WHEN NEW.voucher_descartavel_id IS NOT NULL THEN
                validate_disposable_voucher(NEW.codigo_voucher)
            ELSE
                validate_common_voucher(NEW.codigo_voucher)
        END
    );

-- Função para validar voucher comum
CREATE OR REPLACE FUNCTION validate_common_voucher(p_codigo VARCHAR(4))
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM vouchers_comuns
        WHERE codigo = p_codigo
        AND NOT usado
        AND data_validade >= CURRENT_DATE
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para validar voucher extra
CREATE OR REPLACE FUNCTION validate_extra_voucher(p_codigo VARCHAR(4))
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM vouchers_extras
        WHERE codigo = p_codigo
        AND NOT usado
        AND data_validade >= CURRENT_DATE
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para validar voucher descartável
CREATE OR REPLACE FUNCTION validate_disposable_voucher(p_codigo VARCHAR(4))
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM vouchers_descartaveis
        WHERE codigo = p_codigo
        AND NOT usado
        AND data_validade >= CURRENT_DATE
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## Notas de Implementação

1. Validação por Código:
   - Todos os tipos de voucher são validados pelo código de 4 dígitos
   - Não é necessário login do usuário para usar voucher
   - Sistema valida regras específicas para cada tipo de voucher

2. Registro de Uso:
   - Apenas o sistema pode registrar o uso do voucher
   - Validações específicas são aplicadas por tipo de voucher
   - Registro inclui data/hora e tipo de refeição

3. Consulta de Histórico:
   - Gerentes e admins (autenticados) podem consultar histórico
   - Usuários comuns não têm acesso ao histórico