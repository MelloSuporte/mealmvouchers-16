import * as XLSX from 'xlsx';
import logger from '@/config/logger';
import { formatCurrency, formatDate } from './formatters';

export const exportToExcel = (data) => {
  try {
    const excelData = data?.map(item => ({
      'Data/Hora': formatDate(item.data_uso),
      'Usuário': item.nome_usuario || '-',
      'CPF': item.cpf || '-',
      'Código': item.voucher_descartavel_id ? (item.codigo || '-') : (item.codigo_voucher || '-'),
      'Tipo Voucher': item.voucher_descartavel_id ? 'descartável' : 'comum',
      'Empresa': item.nome_empresa || '-',
      'Refeição': item.tipo_refeicao || '-',
      'Valor': formatCurrency(item.valor_refeicao || 0),
      'Turno': item.turno || '-',
      'Setor': item.nome_setor || '-'
    })) || [];

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(excelData);

    const wscols = [
      { wch: 20 }, // Data/Hora
      { wch: 30 }, // Usuário
      { wch: 15 }, // CPF
      { wch: 15 }, // Código
      { wch: 15 }, // Tipo Voucher
      { wch: 30 }, // Empresa
      { wch: 20 }, // Refeição
      { wch: 15 }, // Valor
      { wch: 15 }, // Turno
      { wch: 20 }  // Setor
    ];

    ws['!cols'] = wscols;

    return { wb, ws };
  } catch (error) {
    logger.error('Erro ao preparar dados Excel:', error);
    throw error;
  }
};