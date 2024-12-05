-- Remove a restrição UNIQUE da coluna codigo
ALTER TABLE vouchers_extras DROP CONSTRAINT IF EXISTS vouchers_extras_codigo_key;

-- Adiciona um índice não-único para manter a performance das consultas
CREATE INDEX IF NOT EXISTS idx_vouchers_extras_codigo ON vouchers_extras(codigo);