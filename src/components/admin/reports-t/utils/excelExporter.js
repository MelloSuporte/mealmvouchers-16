import * as XLSX from 'xlsx';
import logger from '@/config/logger';
import { formatCurrency, formatDate } from './formatters';

export const exportToExcel = (data) => {
  try {
    const excelData = data?.map(item => ({
      'Data/Hora': formatDate(item.usado_em),
      'Nome': item.nome_pessoa || '-',
      'Empresa Voucher': item.nome_empresa || '-',
      'Refeição': item.tipos_refeicao?.nome || '-',
      'Valor': formatCurrency(item.tipos_refeicao?.valor || 0),
      'Empresa': item.nome_empresa || '-',
      'Código': item.codigo || '-',
      'Valor': formatCurrency(item.tipos_refeicao?.valor || 0)
    })) || [];

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(excelData);

    const wscols = [
      { wch: 20 }, // Data/Hora
      { wch: 30 }, // Nome
      { wch: 30 }, // Empresa Voucher
      { wch: 20 }, // Refeição
      { wch: 15 }, // Valor
      { wch: 30 }, // Empresa
      { wch: 15 }, // Código
      { wch: 15 }  // Valor
    ];

    ws['!cols'] = wscols;

    return { wb, ws };
  } catch (error) {
    logger.error('Erro ao preparar dados Excel:', error);
    throw error;
  }
};