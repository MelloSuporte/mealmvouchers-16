import * as XLSX from 'xlsx';
import logger from '@/config/logger';
import { formatCurrency, formatDate } from './formatters';

export const exportToExcel = (data) => {
  try {
    logger.info('Iniciando exportação Excel de vouchers comuns:', data?.length || 0, 'registros');
    
    // Mapear dados para o formato do Excel
    const excelData = data?.map(item => ({
      'Data/Hora': formatDate(item.data_uso || item.usado_em),
      'Nome': item.nome_usuario || item.nome_pessoa || '-',
      'Empresa': item.nome_empresa || '-',
      'Tipo Refeição': item.tipo_refeicao || (item.tipos_refeicao?.nome) || '-',
      'Código': item.codigo_voucher || '-',
      'Valor': formatCurrency(item.valor_refeicao || item.tipos_refeicao?.valor || 0),
      'Turno': item.turno || '-',
      'Setor': item.setor || item.nome_setor || '-'
    })) || [];

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(excelData);

    // Definir largura das colunas
    const wscols = [
      { wch: 25 }, // Data/Hora
      { wch: 35 }, // Nome
      { wch: 30 }, // Empresa
      { wch: 25 }, // Tipo Refeição
      { wch: 20 }, // Código
      { wch: 20 }, // Valor
      { wch: 15 }, // Turno
      { wch: 25 }  // Setor
    ];

    ws['!cols'] = wscols;

    return { wb, ws };
  } catch (error) {
    logger.error('Erro ao preparar dados Excel:', error);
    throw error;
  }
};