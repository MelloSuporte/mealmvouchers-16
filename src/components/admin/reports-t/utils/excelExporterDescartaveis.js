import * as XLSX from 'xlsx';
import logger from '@/config/logger';
import { formatCurrency, formatDate } from './formatters';
import { supabase } from '@/config/supabase';

export const exportToExcelDescartaveis = async (filters) => {
  try {
    logger.info('Iniciando exportação Excel de vouchers descartáveis...', filters);

    // Buscar dados dos vouchers descartáveis
    let query = supabase
      .from('vouchers_descartaveis')
      .select(`
        id,
        usado_em,
        nome_pessoa,
        nome_empresa,
        tipos_refeicao (
          id,
          nome,
          valor
        )
      `)
      .not('usado_em', 'is', null); // Apenas vouchers utilizados

    // Aplicar filtros
    if (filters?.startDate) {
      const startDate = new Date(filters.startDate);
      query = query.gte('usado_em', startDate.toISOString());
    }
    if (filters?.endDate) {
      const endDate = new Date(filters.endDate);
      query = query.lte('usado_em', endDate.toISOString());
    }

    const { data: vouchers, error } = await query;

    if (error) {
      logger.error('Erro ao buscar vouchers:', error);
      throw error;
    }

    // Mapear dados para o formato do Excel
    const excelData = vouchers?.map(item => ({
      'Data/Hora': formatDate(item.usado_em),
      'Pessoa': item.nome_pessoa || '-',
      'Refeição': item.tipos_refeicao?.nome || '-',
      'Valor': formatCurrency(item.tipos_refeicao?.valor || 0),
      'Empresa': item.nome_empresa || '-'
    })) || [];

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(excelData);

    // Definir largura das colunas
    const wscols = [
      { wch: 25 }, // Data/Hora
      { wch: 35 }, // Pessoa
      { wch: 25 }, // Refeição
      { wch: 20 }, // Valor
      { wch: 30 }  // Empresa
    ];

    ws['!cols'] = wscols;

    return { wb, ws };
  } catch (error) {
    logger.error('Erro ao preparar dados Excel:', error);
    throw error;
  }
};