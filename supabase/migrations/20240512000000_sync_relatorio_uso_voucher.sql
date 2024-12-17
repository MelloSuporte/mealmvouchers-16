-- Função para sincronizar dados para relatorio_uso_voucher
CREATE OR REPLACE FUNCTION sync_relatorio_uso_voucher()
RETURNS trigger
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO relatorio_uso_voucher (
        data_uso,
        usuario_id,
        nome_usuario,
        cpf,
        empresa_id,
        nome_empresa,
        turno,
        setor_id,
        nome_setor,
        tipo_refeicao,
        valor,
        observacao
    )
    SELECT
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
        tr.valor,
        uv.observacao
    FROM uso_voucher uv
    JOIN usuarios u ON u.id = uv.usuario_id
    JOIN empresas e ON e.id = u.empresa_id
    JOIN turnos t ON t.id = u.turno_id
    JOIN setores s ON s.id = u.setor_id
    JOIN tipos_refeicao tr ON tr.id = uv.tipo_refeicao_id
    WHERE uv.id = NEW.id;

    RETURN NEW;
END;
$$;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS trigger_sync_relatorio_uso_voucher ON uso_voucher;

-- Create trigger
CREATE TRIGGER trigger_sync_relatorio_uso_voucher
    AFTER INSERT ON uso_voucher
    FOR EACH ROW
    EXECUTE FUNCTION sync_relatorio_uso_voucher();

-- Sincroniza dados existentes
INSERT INTO relatorio_uso_voucher (
    data_uso,
    usuario_id,
    nome_usuario,
    cpf,
    empresa_id,
    nome_empresa,
    turno,
    setor_id,
    nome_setor,
    tipo_refeicao,
    valor,
    observacao
)
SELECT
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
    tr.valor,
    uv.observacao
FROM uso_voucher uv
JOIN usuarios u ON u.id = uv.usuario_id
JOIN empresas e ON e.id = u.empresa_id
JOIN turnos t ON t.id = u.turno_id
JOIN setores s ON s.id = u.setor_id
JOIN tipos_refeicao tr ON tr.id = uv.tipo_refeicao_id
ON CONFLICT (id) DO UPDATE
SET
    data_uso = EXCLUDED.data_uso,
    usuario_id = EXCLUDED.usuario_id,
    nome_usuario = EXCLUDED.nome_usuario,
    cpf = EXCLUDED.cpf,
    empresa_id = EXCLUDED.empresa_id,
    nome_empresa = EXCLUDED.nome_empresa,
    turno = EXCLUDED.turno,
    setor_id = EXCLUDED.setor_id,
    nome_setor = EXCLUDED.nome_setor,
    tipo_refeicao = EXCLUDED.tipo_refeicao,
    valor = EXCLUDED.valor,
    observacao = EXCLUDED.observacao;