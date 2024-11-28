-- Habilitar RLS para a tabela vouchers_extras
ALTER TABLE vouchers_extras ENABLE ROW LEVEL SECURITY;

-- Política para SELECT
CREATE POLICY "Vouchers extras visíveis para todos os usuários autenticados"
ON vouchers_extras FOR SELECT
TO authenticated
USING (true);

-- Política para INSERT
CREATE POLICY "Apenas usuários autenticados podem criar vouchers extras"
ON vouchers_extras FOR INSERT
TO authenticated
WITH CHECK (true);

-- Política para UPDATE
CREATE POLICY "Apenas usuários autenticados podem atualizar vouchers extras"
ON vouchers_extras FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Garantir que a tabela está acessível para o role anon
GRANT SELECT, INSERT, UPDATE ON vouchers_extras TO anon;
GRANT USAGE ON SEQUENCE vouchers_extras_id_seq TO anon;