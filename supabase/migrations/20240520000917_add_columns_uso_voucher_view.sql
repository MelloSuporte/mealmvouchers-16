-- Recria a view mantendo os dados existentes e adicionando novas colunas
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
    s.nome_setor,
    tr.nome as tipo_refeicao,
    tr.valor as valor_refeicao,
    uv.observacao,
    CASE 
        WHEN uv.voucher_descartavel_id IS NOT NULL THEN 'descartavel'
        ELSE 'comum'
    END as tipo_voucher,
    CASE 
        WHEN uv.voucher_descartavel_id IS NOT NULL THEN vd.codigo
        ELSE u.voucher
    END as codigo_voucher
FROM uso_voucher uv
LEFT JOIN usuarios u ON uv.usuario_id = u.id
LEFT JOIN empresas e ON u.empresa_id = e.id
LEFT JOIN turnos t ON u.turno_id = t.id
LEFT JOIN setores s ON u.setor_id = s.id
LEFT JOIN tipos_refeicao tr ON uv.tipo_refeicao_id = tr.id
LEFT JOIN vouchers_descartaveis vd ON uv.voucher_descartavel_id = vd.id;

-- Mantém as permissões existentes
GRANT SELECT ON vw_uso_voucher_detalhado TO authenticated;

-- Adiciona comentário explicativo
COMMENT ON VIEW vw_uso_voucher_detalhado IS 'View detalhada do uso de vouchers com todas as informações relacionadas';