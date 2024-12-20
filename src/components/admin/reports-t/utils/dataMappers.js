export const mapVoucherData = (data) => {
  return data?.map(item => ({
    id: item.id,
    data_uso: item.usado_em,
    usuario_id: item.usuario_id,
    nome_usuario: item.nome_usuario || 'Usuário Teste',
    cpf: item.cpf || '000.000.000-00',
    empresa: item.empresa_id,
    nome_empresa: item.nome_empresa || 'Empresa Teste',
    turno: item.turno || 'Turno Teste',
    setor_id: item.setor_id || 1,
    nome_setor: item.nome_setor || 'Setor Teste',
    tipo_refeicao: item.tipo_refeicao || 'Não especificado',
    valor_refeicao: item.valor_refeicao || 0,
    observacao: item.observacao
  })) || [];
};