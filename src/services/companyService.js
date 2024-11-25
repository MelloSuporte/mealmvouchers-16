import { supabase } from '../config/supabase.js';
import logger from '../config/logger.js';
import { uploadLogo } from '../utils/supabaseStorage.js';

export const checkDuplicateCNPJ = async (cnpj, excluirId = null) => {
  const query = supabase
    .from('empresas')
    .select('id')
    .eq('cnpj', cnpj);
    
  if (excluirId) {
    query.neq('id', excluirId);
  }
  
  const { data: empresaExistente } = await query.maybeSingle();
  return empresaExistente;
};

export const createCompany = async (nome, cnpj, arquivoBuffer, nomeOriginal) => {
  let urlLogo = null;
  
  if (arquivoBuffer) {
    urlLogo = await uploadLogo(arquivoBuffer, nomeOriginal);
  }

  const { data: novaEmpresa, error: erroInsercao } = await supabase
    .from('empresas')
    .insert([{
      nome: nome.trim(),
      cnpj: cnpj.replace(/[^\d]/g, ''),
      logo: urlLogo
    }])
    .select()
    .single();

  if (erroInsercao) throw erroInsercao;
  return novaEmpresa;
};

export const updateCompany = async (id, nome, cnpj, arquivoBuffer, nomeOriginal) => {
  const dadosAtualizacao = {
    nome: nome.trim(),
    cnpj: cnpj.replace(/[^\d]/g, '')
  };

  if (arquivoBuffer) {
    dadosAtualizacao.logo = await uploadLogo(arquivoBuffer, nomeOriginal);
  }

  const { data: empresaAtualizada, error: erroAtualizacao } = await supabase
    .from('empresas')
    .update(dadosAtualizacao)
    .eq('id', id)
    .select()
    .single();

  if (erroAtualizacao) throw erroAtualizacao;
  return empresaAtualizada;
};