import * as XLSX from 'xlsx';
import logger from '@/config/logger';
import { formatCurrency, formatDate } from './formatters';

export const exportToExcel = (data) => {
  try {
    logger.info('Iniciando exportação Excel com dados:', data?.length || 0, 'registros');
    
    const excelData = data?.map(item => ({
      'Data/Hora': formatDate(item.usado_em),
      'Nome': item.nome_pessoa || '-',
      'Empresa': item.nome_empresa || '-',
      'Tipo Refeição': item.tipos_refeicao?.nome || '-',
      'Qtd': 1,
      'Valor': formatCurrency(item.tipos_refeicao?.valor || 0)
    })) || [];

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(excelData);

    // Definir largura das colunas
    const wscols = [
      { wch: 20 }, // Data/Hora
      { wch: 30 }, // Nome
      { wch: 30 }, // Empresa
      { wch: 20 }, // Tipo Refeição
      { wch: 10 }, // Qtd
      { wch: 15 }  // Valor
    ];

    ws['!cols'] = wscols;

    return { wb, ws };
  } catch (error) {
    logger.error('Erro ao preparar dados Excel:', error);
    throw error;
  }
};