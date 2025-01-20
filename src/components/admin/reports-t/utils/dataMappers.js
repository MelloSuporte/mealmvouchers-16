export const mapVoucherData = (data) => {
  return data?.map(item => ({
    id: item.id,
    data_uso: item.data_uso,
    usado_em: item.usado_em,
    usuario_id: item.usuario_id,
    nome_usuario: item.nome_usuario || 'N/A',
    nome_pessoa: item.nome_pessoa || 'N/A',
    cpf: item.cpf || 'N/A',
    empresa_id: item.empresa_id,
    nome_empresa: item.nome_empresa || 'N/A',
    turno: item.turno || 'N/A',
    setor_id: item.setor_id,
    nome_setor: item.nome_setor || 'N/A',
    tipo_refeicao: item.tipo_refeicao || 'N/A',
    tipos_refeicao: {
      nome: item.tipo_refeicao || 'N/A',
      valor: item.valor_refeicao || 0
    },
    valor_refeicao: item.valor_refeicao || 0,
    observacao: item.observacao || '',
    codigo: item.codigo_voucher || item.codigo || 'N/A',
    codigo_voucher: item.codigo_voucher || item.codigo || 'N/A',
    tipo_voucher: item.tipo_voucher || 'comum',
    voucher_descartavel_id: item.voucher_descartavel_id
  })) || [];
};