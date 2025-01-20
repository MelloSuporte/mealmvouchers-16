export const mapVoucherData = (data) => {
  return data?.map(item => ({
    id: item.id,
    data_uso: item.data_uso,
    usuario_id: item.usuario_id,
    nome_usuario: item.nome_usuario || 'N/A',
    cpf: item.cpf || 'N/A',
    empresa_id: item.empresa_id,
    nome_empresa: item.nome_empresa || 'N/A',
    turno: item.turno || 'N/A',
    setor_id: item.setor_id,
    nome_setor: item.nome_setor || 'N/A',
    tipo_refeicao: item.tipo_refeicao || 'N/A',
    valor: item.valor_refeicao || 0,
    observacao: item.observacao || '',
    codigo_voucher: item.codigo_voucher || 'N/A',
    tipo_voucher: item.tipo_voucher || 'comum'
  })) || [];
};