-- Verifica se a tabela já existe antes de criar
DO $$
DECLARE
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'relatorio_uso_voucher') THEN
        -- Create new table
        CREATE TABLE relatorio_uso_voucher (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            data_uso TIMESTAMP WITH TIME ZONE NOT NULL,
            usuario_id UUID REFERENCES usuarios(id),
            nome_usuario VARCHAR(255),
            cpf VARCHAR(14),
            empresa_id UUID REFERENCES empresas(id),
            nome_empresa VARCHAR(255),
            turno VARCHAR(50),
            setor_id INTEGER REFERENCES setores(id),
            nome_setor VARCHAR(255),
            tipo_refeicao VARCHAR(255),
            valor DECIMAL(10,2),
            observacao TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );

        -- Create indexes for better query performance
        CREATE INDEX IF NOT EXISTS idx_relatorio_uso_data ON relatorio_uso_voucher(data_uso);
        CREATE INDEX IF NOT EXISTS idx_relatorio_uso_empresa ON relatorio_uso_voucher(empresa_id);
        CREATE INDEX IF NOT EXISTS idx_relatorio_uso_setor ON relatorio_uso_voucher(setor_id);
        CREATE INDEX IF NOT EXISTS idx_relatorio_uso_usuario ON relatorio_uso_voucher(usuario_id);

        -- Enable RLS
        ALTER TABLE relatorio_uso_voucher ENABLE ROW LEVEL SECURITY;

        -- Create RLS policies
        CREATE POLICY "Usuários podem ver registros de sua empresa"
            ON relatorio_uso_voucher
            FOR SELECT
            TO authenticated
            USING (
                empresa_id IN (
                    SELECT empresa_id 
                    FROM usuarios 
                    WHERE id = auth.uid()
                )
            );

        -- Create function to update timestamps with explicit search path and security settings
        CREATE OR REPLACE FUNCTION update_relatorio_uso_voucher_timestamp()
        RETURNS TRIGGER
        SECURITY DEFINER
        SET search_path = 'public'
        LANGUAGE plpgsql 
        AS $func$
        BEGIN
            NEW.updated_at = CURRENT_TIMESTAMP;
            RETURN NEW;
        END;
        $func$;

        -- Create trigger for timestamp updates
        CREATE TRIGGER update_relatorio_uso_voucher_timestamp
            BEFORE UPDATE ON relatorio_uso_voucher
            FOR EACH ROW
            EXECUTE FUNCTION update_relatorio_uso_voucher_timestamp();

        -- Grant permissions
        GRANT SELECT ON relatorio_uso_voucher TO authenticated;
    END IF;
END;
$$;