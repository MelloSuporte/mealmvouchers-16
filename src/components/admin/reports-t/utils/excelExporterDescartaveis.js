import * as XLSX from 'xlsx';
import logger from '@/config/logger';
import { formatCurrency, formatDate } from './formatters';
import { supabase } from '@/config/supabase';

export const exportToExcelDescartaveis = async (filters) => {
  try {
    logger.info('Iniciando exportação Excel de vouchers descartáveis...', filters);

    // Ajustar as datas para considerar o dia inteiro
    const startDate = filters?.startDate ? new Date(filters.startDate) : null;
    const endDate = filters?.endDate ? new Date(filters.endDate) : null;

    if (startDate) {
      startDate.setHours(0, 0, 0, 0);
    }
    
    if (endDate) {
      endDate.setHours(23, 59, 59, 999);
    }

    // Buscar dados com as datas ajustadas
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
      .order('usado_em', { ascending: false });

    if (startDate) {
      query = query.gte('usado_em', startDate.toISOString());
    }

    if (endDate) {
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