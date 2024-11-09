import { supabase } from '../config/supabase.js';
import logger from '../config/logger.js';
import { uploadLogo } from '../utils/supabaseStorage.js';

export const checkDuplicateCNPJ = async (cnpj, excludeId = null) => {
  const query = supabase
    .from('empresas')
    .select('id')
    .eq('cnpj', cnpj);
    
  if (excludeId) {
    query.neq('id', excludeId);
  }
  
  const { data: existingCompany } = await query.maybeSingle();
  return existingCompany;
};

export const createCompany = async (nome, cnpj, fileBuffer, originalName) => {
  let logoUrl = null;
  
  if (fileBuffer) {
    logoUrl = await uploadLogo(fileBuffer, originalName);
  }

  const { data: newCompany, error: insertError } = await supabase
    .from('empresas')
    .insert([{
      nome: nome.trim(),
      cnpj: cnpj.replace(/[^\d]/g, ''),
      logo: logoUrl
    }])
    .select()
    .single();

  if (insertError) throw insertError;
  return newCompany;
};

export const updateCompany = async (id, nome, cnpj, fileBuffer, originalName) => {
  const updateData = {
    nome: nome.trim(),
    cnpj: cnpj.replace(/[^\d]/g, '')
  };

  if (fileBuffer) {
    updateData.logo = await uploadLogo(fileBuffer, originalName);
  }

  const { data: updatedCompany, error: updateError } = await supabase
    .from('empresas')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (updateError) throw updateError;
  return updatedCompany;
};