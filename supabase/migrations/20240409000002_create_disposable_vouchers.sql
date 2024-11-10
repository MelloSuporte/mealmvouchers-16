-- Create disposable_vouchers table
CREATE TABLE IF NOT EXISTS disposable_vouchers (
  id SERIAL PRIMARY KEY,
  code VARCHAR(4) NOT NULL,
  meal_type_id UUID REFERENCES tipos_refeicao(id),
  expired_at TIMESTAMP WITH TIME ZONE NOT NULL,
  is_used BOOLEAN DEFAULT FALSE,
  used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(code)
);

-- Enable RLS
ALTER TABLE disposable_vouchers ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Vouchers são visíveis para todos"
  ON disposable_vouchers FOR SELECT
  USING (true);

CREATE POLICY "Apenas usuários autenticados podem inserir vouchers"
  ON disposable_vouchers FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Apenas usuários autenticados podem atualizar vouchers"
  ON disposable_vouchers FOR UPDATE
  USING (auth.role() = 'authenticated');