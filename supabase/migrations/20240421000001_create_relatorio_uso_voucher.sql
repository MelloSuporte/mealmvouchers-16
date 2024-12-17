-- Drop view if exists (será substituída pela tabela)
DROP VIEW IF EXISTS vw_uso_voucher_detalhado;

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
CREATE INDEX idx_relatorio_uso_data ON relatorio_uso_voucher(data_uso);
CREATE INDEX idx_relatorio_uso_empresa ON relatorio_uso_voucher(empresa_id);
CREATE INDEX idx_relatorio_uso_setor ON relatorio_uso_voucher(setor_id);
CREATE INDEX idx_relatorio_uso_usuario ON relatorio_uso_voucher(usuario_id);

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

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION update_relatorio_uso_voucher_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for timestamp updates
CREATE TRIGGER update_relatorio_uso_voucher_timestamp
    BEFORE UPDATE ON relatorio_uso_voucher
    FOR EACH ROW
    EXECUTE FUNCTION update_relatorio_uso_voucher_timestamp();

-- Update useUsageData hook to use new table
<lov-write file_path="src/components/admin/reports/hooks/useUsageData.js">
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/config/supabase';

export const useUsageData = (filters) => {
  return useQuery({
    queryKey: ['usage-data', filters],
    queryFn: async () => {
      try {
        console.log('Buscando dados de uso com filtros:', filters);
        
        let query = supabase
          .from('relatorio_uso_voucher')
          .select('*');

        // Filtro de data
        if (filters.startDate && filters.endDate) {
          console.log('Aplicando filtro de data:', {
            start: filters.startDate,
            end: filters.endDate
          });
          
          query = query
            .gte('data_uso', filters.startDate)
            .lte('data_uso', filters.endDate);
        }

        // Filtro de empresa
        if (filters.company && filters.company !== 'all') {
          console.log('Aplicando filtro de empresa:', filters.company);
          query = query.eq('empresa_id', filters.company);
        }

        // Filtro de turno
        if (filters.shift && filters.shift !== 'all') {
          console.log('Aplicando filtro de turno:', filters.shift);
          query = query.eq('turno', filters.shift);
        }

        // Filtro de setor
        if (filters.sector && filters.sector !== 'all') {
          console.log('Aplicando filtro de setor:', filters.sector);
          query = query.eq('setor_id', filters.sector);
        }

        // Filtro de tipo de refeição
        if (filters.mealType && filters.mealType !== 'all') {
          console.log('Aplicando filtro de tipo de refeição:', filters.mealType);
          query = query.eq('tipo_refeicao', filters.mealType);
        }

        console.log('Query final:', query);
        
        const { data, error } = await query;

        if (error) {
          console.error('Erro ao buscar dados:', error);
          throw error;
        }

        console.log('Dados recuperados:', data?.length || 0, 'registros');
        return data || [];
      } catch (error) {
        console.error('Erro na query:', error);
        throw error;
      }
    },
    enabled: !!filters
  });
};