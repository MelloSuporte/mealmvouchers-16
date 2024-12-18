-- Primeiro atualizamos a view mantendo os nomes originais das colunas
CREATE OR REPLACE VIEW vw_uso_voucher_detalhado AS
SELECT 
    uv.id,
    uv.usado_em,
    u.id as id_usuario,
    u.nome as nome_usuario,
    u.cpf,
    e.id as id_empresa,
    e.nome as nome_empresa,
    t.tipo_turno as turno,
    s.id as id_setor,
    s.nome_setor,
    tr.nome as tipo_refeicao,
    tr.valor as valor_refeicao,
    uv.observacao
FROM uso_voucher uv
LEFT JOIN usuarios u ON uv.usuario_id = u.id
LEFT JOIN empresas e ON u.empresa_id = e.id
LEFT JOIN turnos t ON u.turno_id = t.id
LEFT JOIN setores s ON u.setor_id = s.id
LEFT JOIN tipos_refeicao tr ON uv.tipo_refeicao_id = tr.id;

-- Agora renomeamos as colunas uma por uma na ordem correta
ALTER VIEW vw_uso_voucher_detalhado RENAME COLUMN usado_em TO data_uso;
ALTER VIEW vw_uso_voucher_detalhado RENAME COLUMN id_usuario TO usuario_id;
ALTER VIEW vw_uso_voucher_detalhado RENAME COLUMN id_empresa TO empresa_id;
ALTER VIEW vw_uso_voucher_detalhado RENAME COLUMN id_setor TO setor_id;

-- Atualiza as permissões
GRANT SELECT ON vw_uso_voucher_detalhado TO authenticated;

-- Adiciona comentário
COMMENT ON VIEW vw_uso_voucher_detalhado IS 'View detalhada do uso de vouchers com todas as informações relacionadas';