import * as XLSX from 'xlsx';
import logger from '@/config/logger';
import { formatCurrency, formatDate } from './formatters';

export const exportToExcel = (data) => {
  try {
    logger.info('Iniciando exportação Excel com dados:', data?.length || 0, 'registros');
    
    // Filtrar apenas vouchers descartáveis
    const disposableVouchers = data?.filter(item => 
      item.tipo_voucher === 'descartavel' || item.voucher_descartavel_id
    );

    logger.info('Vouchers descartáveis filtrados:', disposableVouchers?.length || 0, 'registros');
    
    // Mapear dados para o formato do Excel
    const excelData = disposableVouchers?.map(item => ({
      'Data/Hora': formatDate(item.usado_em || item.data_uso),
      'Pessoa': item.nome_pessoa || item.nome_usuario || '-',
      'Refeição': item.tipos_refeicao?.nome || item.tipo_refeicao || '-',
      'Valor': formatCurrency(item.tipos_refeicao?.valor || item.valor_refeicao || 0),
      'Código': item.codigo || '-',
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
      { wch: 20 }, // Código
      { wch: 30 }  // Empresa
    ];

    ws['!cols'] = wscols;

    return { wb, ws };
  } catch (error) {
    logger.error('Erro ao preparar dados Excel:', error);
    throw error;
  }
};