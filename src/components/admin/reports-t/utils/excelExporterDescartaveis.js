import * as XLSX from 'xlsx';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import logger from '@/config/logger';
import { formatCurrency } from './formatters';

export const exportToExcelDescartaveis = async (data) => {
  try {
    logger.info('Iniciando exportação Excel de vouchers descartáveis:', data?.length || 0, 'registros');
    
    // Mapear dados para o formato do Excel
    const excelData = data?.map(item => ({
      'Tipo Refeição': item.tipos_refeicao?.nome || '-',
      'Empresa': item.nome_empresa || '-',
      'Data Requisição': item.data_requisicao ? format(new Date(item.data_requisicao), 'dd/MM/yyyy HH:mm', { locale: ptBR }) : '-',
      'Data Uso': item.usado_em ? format(new Date(item.usado_em), 'dd/MM/yyyy HH:mm', { locale: ptBR }) : '-',
      'Solicitante': item.solicitante || '-'
    })) || [];

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(excelData);

    // Definir largura das colunas
    const wscols = [
      { wch: 35 }, // Tipo Refeição
      { wch: 35 }, // Empresa
      { wch: 35 }, // Data Requisição
      { wch: 35 }, // Data Uso
      { wch: 35 }  // Solicitante
    ];

    ws['!cols'] = wscols;

    return { wb, ws };
  } catch (error) {
    logger.error('Erro ao preparar dados Excel:', error);
    throw error;
  }
};