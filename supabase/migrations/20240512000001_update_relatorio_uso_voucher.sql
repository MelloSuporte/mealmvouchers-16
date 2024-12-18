-- Atualiza a estrutura da tabela relatorio_uso_voucher
ALTER TABLE relatorio_uso_voucher
ADD COLUMN IF NOT EXISTS uso_id UUID,
ADD COLUMN IF NOT EXISTS codigo_voucher VARCHAR(255),
ADD COLUMN IF NOT EXISTS tipo_voucher VARCHAR(50),
ADD COLUMN IF NOT EXISTS cpf_usuario VARCHAR(14),
ADD COLUMN IF NOT EXISTS valor_refeicao DECIMAL(10,2);

-- Atualiza as políticas RLS
ALTER TABLE relatorio_uso_voucher ENABLE ROW LEVEL SECURITY;

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

-- Atualiza a função de sincronização
CREATE OR REPLACE FUNCTION sync_relatorio_uso_voucher()
RETURNS trigger
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO relatorio_uso_voucher (
        uso_id,
        data_uso,
        codigo_voucher,
        tipo_voucher,
        usuario_id,
        nome_usuario,
        cpf_usuario,
        empresa_id,
        nome_empresa,
        turno,
        setor_id,
        nome_setor,
        tipo_refeicao,
        valor_refeicao,
        observacao,
        created_at
    )
    SELECT
        uv.id as uso_id,
        uv.usado_em as data_uso,
        COALESCE(u.voucher, ve.codigo) as codigo_voucher,
        CASE 
            WHEN u.voucher IS NOT NULL THEN 'comum'
            WHEN ve.id IS NOT NULL THEN 'extra'
            ELSE 'descartavel'
        END as tipo_voucher,
        u.id as usuario_id,
        u.nome as nome_usuario,
        u.cpf as cpf_usuario,
        e.id as empresa_id,
        e.nome as nome_empresa,
        t.tipo_turno as turno,
        s.id as setor_id,
        s.nome_setor,
        tr.nome as tipo_refeicao,
        tr.valor as valor_refeicao,
        uv.observacao,
        CURRENT_TIMESTAMP as created_at
    FROM uso_voucher uv
    LEFT JOIN usuarios u ON uv.usuario_id = u.id
    LEFT JOIN vouchers_extras ve ON ve.usuario_id = uv.usuario_id 
        AND ve.tipo_refeicao_id = uv.tipo_refeicao_id 
        AND ve.usado_em = uv.usado_em
    LEFT JOIN empresas e ON u.empresa_id = e.id
    LEFT JOIN turnos t ON u.turno_id = t.id
    LEFT JOIN setores s ON u.setor_id = s.id
    LEFT JOIN tipos_refeicao tr ON uv.tipo_refeicao_id = tr.id
    WHERE uv.id = NEW.id;

    RETURN NEW;
END;
$$;

-- Recria o trigger
DROP TRIGGER IF EXISTS trigger_sync_relatorio_uso_voucher ON uso_voucher;

CREATE TRIGGER trigger_sync_relatorio_uso_voucher
    AFTER INSERT ON uso_voucher
    FOR EACH ROW
    EXECUTE FUNCTION sync_relatorio_uso_voucher();

-- Adiciona comentário explicativo
COMMENT ON TABLE relatorio_uso_voucher IS 'Tabela de relatório de uso de vouchers com dados denormalizados para consulta rápida';