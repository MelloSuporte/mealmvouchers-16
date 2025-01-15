-- Add missing columns to uso_voucher if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'uso_voucher' 
        AND column_name = 'voucher_extra_id'
    ) THEN
        ALTER TABLE uso_voucher 
        ADD COLUMN voucher_extra_id UUID REFERENCES vouchers_extras(id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'uso_voucher' 
        AND column_name = 'voucher_descartavel_id'
    ) THEN
        ALTER TABLE uso_voucher 
        ADD COLUMN voucher_descartavel_id UUID REFERENCES vouchers_descartaveis(id);
    END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_uso_voucher_extra_id 
ON uso_voucher(voucher_extra_id);

CREATE INDEX IF NOT EXISTS idx_uso_voucher_descartavel_id 
ON uso_voucher(voucher_descartavel_id);

-- Drop and recreate the view with correct columns
DROP VIEW IF EXISTS vw_uso_voucher_detalhado;

CREATE OR REPLACE VIEW vw_uso_voucher_detalhado AS
SELECT 
    uv.id,
    uv.usado_em as data_uso,
    u.id as usuario_id,
    u.nome as nome_usuario,
    u.cpf,
    e.id as empresa_id,
    e.nome as nome_empresa,
    t.tipo_turno as turno,
    s.id as setor_id,
    s.nome as nome_setor,
    tr.nome as tipo_refeicao,
    tr.valor as valor_refeicao,
    uv.observacao,
    uv.voucher_descartavel_id,
    uv.voucher_extra_id,
    CASE 
        WHEN uv.voucher_descartavel_id IS NOT NULL THEN 'descartavel'
        WHEN uv.voucher_extra_id IS NOT NULL THEN 'extra'
        ELSE 'comum'
    END as tipo_voucher,
    CASE 
        WHEN uv.voucher_descartavel_id IS NOT NULL THEN vd.codigo
        WHEN uv.voucher_extra_id IS NOT NULL THEN ve.codigo
        ELSE u.voucher
    END as codigo_voucher
FROM uso_voucher uv
LEFT JOIN usuarios u ON uv.usuario_id = u.id
LEFT JOIN empresas e ON u.empresa_id = e.id
LEFT JOIN turnos t ON u.turno_id = t.id
LEFT JOIN setores s ON u.setor_id = s.id
LEFT JOIN tipos_refeicao tr ON uv.tipo_refeicao_id = tr.id
LEFT JOIN vouchers_descartaveis vd ON uv.voucher_descartavel_id = vd.id
LEFT JOIN vouchers_extras ve ON uv.voucher_extra_id = ve.id;

-- Set permissions
ALTER VIEW vw_uso_voucher_detalhado OWNER TO postgres;
GRANT SELECT ON vw_uso_voucher_detalhado TO authenticated;

-- Add comment
COMMENT ON VIEW vw_uso_voucher_detalhado IS 'View detalhada do uso de vouchers com todas as informações relacionadas';