import * as XLSX from 'xlsx';
import logger from '@/config/logger';
import { formatCurrency, formatDate } from './formatters';

export const exportToExcel = (data) => {
  try {
    // Preparar dados para Excel
    const excelData = data?.map(item => ({
      'Data/Hora': formatDate(item.data_uso),
      'Usuário': item.nome_usuario || '-',
      'CPF': item.cpf || '-',
      'Empresa': item.nome_empresa || '-',
      'Refeição': item.tipo_refeicao || '-',
      'Valor': formatCurrency(item.valor_refeicao || 0),
      'Turno': item.turno || '-',
      'Setor': item.nome_setor || '-'
    })) || [];

    // Criar workbook e worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(excelData);

    return { wb, ws };
  } catch (error) {
    logger.error('Erro ao preparar dados Excel:', error);
    throw error;
  }
};