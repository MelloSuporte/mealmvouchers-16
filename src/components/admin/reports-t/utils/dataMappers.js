export const mapVoucherData = (data) => {
  return data?.map(item => ({
    id: item.id,
    data_uso: item.data_uso,
    usuario_id: item.usuario_id,
    nome_usuario: item.nome_usuario || 'Usuário Teste',
    cpf: item.cpf || '000.000.000-00',
    empresa_id: item.empresa_id,
    nome_empresa: item.nome_empresa || 'Empresa Teste',
    turno: item.turno || 'Turno Teste',
    setor_id: item.setor_id || 1,
    nome_setor: item.nome_setor || 'Setor Teste',
    tipo_refeicao: item.tipo_refeicao || 'Refeição Teste',
    valor: item.valor || 0,
    observacao: item.observacao,
    tipo_voucher: item.voucher_descartavel_id ? 'descartável' : 
                 item.voucher_extra_id ? 'extra' : 'comum'
  })) || [];
};