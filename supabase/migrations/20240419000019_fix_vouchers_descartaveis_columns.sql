-- Primeiro, vamos verificar e adicionar todas as colunas necessárias
DO $$
BEGIN
    -- Adicionar usuario_id se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'vouchers_descartaveis' 
                  AND column_name = 'usuario_id') THEN
        ALTER TABLE vouchers_descartaveis 
        ADD COLUMN usuario_id UUID REFERENCES auth.users(id);
    END IF;

    -- Adicionar codigo se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'vouchers_descartaveis' 
                  AND column_name = 'codigo') THEN
        ALTER TABLE vouchers_descartaveis 
        ADD COLUMN codigo UUID DEFAULT gen_random_uuid() NOT NULL;
    END IF;

    -- Adicionar tipo_refeicao se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'vouchers_descartaveis' 
                  AND column_name = 'tipo_refeicao') THEN
        ALTER TABLE vouchers_descartaveis 
        ADD COLUMN tipo_refeicao VARCHAR NOT NULL;
    END IF;

    -- Adicionar validade se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'vouchers_descartaveis' 
                  AND column_name = 'validade') THEN
        ALTER TABLE vouchers_descartaveis 
        ADD COLUMN validade DATE NOT NULL;
    END IF;

    -- Adicionar observacao se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'vouchers_descartaveis' 
                  AND column_name = 'observacao') THEN
        ALTER TABLE vouchers_descartaveis 
        ADD COLUMN observacao TEXT;
    END IF;

    -- Adicionar status se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'vouchers_descartaveis' 
                  AND column_name = 'status') THEN
        ALTER TABLE vouchers_descartaveis 
        ADD COLUMN status VARCHAR DEFAULT 'ativo' NOT NULL;
    END IF;

    -- Adicionar criado_por se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'vouchers_descartaveis' 
                  AND column_name = 'criado_por') THEN
        ALTER TABLE vouchers_descartaveis 
        ADD COLUMN criado_por UUID REFERENCES auth.users(id);
    END IF;

    -- Adicionar criado_em se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'vouchers_descartaveis' 
                  AND column_name = 'criado_em') THEN
        ALTER TABLE vouchers_descartaveis 
        ADD COLUMN criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
    END IF;

    -- Adicionar atualizado_em se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'vouchers_descartaveis' 
                  AND column_name = 'atualizado_em') THEN
        ALTER TABLE vouchers_descartaveis 
        ADD COLUMN atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
    END IF;

    -- Adicionar usado_em se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'vouchers_descartaveis' 
                  AND column_name = 'usado_em') THEN
        ALTER TABLE vouchers_descartaveis 
        ADD COLUMN usado_em TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

-- Criar ou atualizar índices
DO $$
BEGIN
    -- Índice para código (se não existir)
    IF NOT EXISTS (SELECT 1 FROM pg_indexes 
                  WHERE tablename = 'vouchers_descartaveis' 
                  AND indexname = 'vouchers_descartaveis_codigo_idx') THEN
        CREATE UNIQUE INDEX vouchers_descartaveis_codigo_idx ON vouchers_descartaveis(codigo);
    END IF;

    -- Índice para usuario_id (se não existir)
    IF NOT EXISTS (SELECT 1 FROM pg_indexes 
                  WHERE tablename = 'vouchers_descartaveis' 
                  AND indexname = 'vouchers_descartaveis_usuario_id_idx') THEN
        CREATE INDEX vouchers_descartaveis_usuario_id_idx ON vouchers_descartaveis(usuario_id);
    END IF;

    -- Índice para status (se não existir)
    IF NOT EXISTS (SELECT 1 FROM pg_indexes 
                  WHERE tablename = 'vouchers_descartaveis' 
                  AND indexname = 'vouchers_descartaveis_status_idx') THEN
        CREATE INDEX vouchers_descartaveis_status_idx ON vouchers_descartaveis(status);
    END IF;
END $$;

-- Adicionar constraints
DO $$
BEGIN
    -- Constraint de status válido
    IF NOT EXISTS (SELECT 1 FROM pg_constraint 
                  WHERE conname = 'vouchers_descartaveis_status_check') THEN
        ALTER TABLE vouchers_descartaveis
        ADD CONSTRAINT vouchers_descartaveis_status_check
        CHECK (status IN ('ativo', 'usado', 'cancelado', 'expirado'));
    END IF;

    -- Constraint de validade futura
    IF NOT EXISTS (SELECT 1 FROM pg_constraint 
                  WHERE conname = 'vouchers_descartaveis_validade_check') THEN
        ALTER TABLE vouchers_descartaveis
        ADD CONSTRAINT vouchers_descartaveis_validade_check
        CHECK (validade > CURRENT_DATE);
    END IF;
END $$;

-- Criar ou atualizar trigger para atualizado_em
CREATE OR REPLACE FUNCTION update_vouchers_descartaveis_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.atualizado_em = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_vouchers_descartaveis_updated_at_trigger ON vouchers_descartaveis;

CREATE TRIGGER update_vouchers_descartaveis_updated_at_trigger
    BEFORE UPDATE ON vouchers_descartaveis
    FOR EACH ROW
    EXECUTE FUNCTION update_vouchers_descartaveis_updated_at();

-- Criar ou atualizar trigger para verificar validade
CREATE OR REPLACE FUNCTION check_voucher_descartavel_validade()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.validade <= CURRENT_DATE THEN
        NEW.status = 'expirado';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS check_voucher_descartavel_validade_trigger ON vouchers_descartaveis;

CREATE TRIGGER check_voucher_descartavel_validade_trigger
    BEFORE INSERT OR UPDATE ON vouchers_descartaveis
    FOR EACH ROW
    EXECUTE FUNCTION check_voucher_descartavel_validade();

-- Atualizar permissões
GRANT SELECT, INSERT, UPDATE ON vouchers_descartaveis TO authenticated;
GRANT ALL ON vouchers_descartaveis TO service_role;
