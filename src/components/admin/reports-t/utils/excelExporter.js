import * as XLSX from 'xlsx';
import logger from '@/config/logger';
import { formatCurrency, formatDate } from './formatters';

export const exportToExcel = (data) => {
  try {
    logger.info('Iniciando exportação Excel com dados:', data?.length || 0, 'registros');
    
    // Mapear dados para o formato do Excel
    const excelData = data?.map(item => {
      // Verificar se é um voucher descartável
      const isDisposable = item.tipo_voucher === 'descartavel' || item.voucher_descartavel_id;
      
      if (isDisposable) {
        return {
          'Data/Hora': formatDate(item.data_uso || item.usado_em),
          'Nome': item.nome_pessoa || '-',
          'Empresa': item.nome_empresa || '-',
          'Tipo Refeição': item.tipos_refeicao?.nome || '-',
          'Qtd': '1',
          'Valor': formatCurrency(item.tipos_refeicao?.valor || 0)
        };
      }

      // Retorna o formato padrão para outros tipos de voucher
      return {
        'Data/Hora': formatDate(item.usado_em || item.data_uso),
        'Nome': item.nome_usuario || '-',
        'Empresa': item.nome_empresa || '-',
        'Tipo Refeição': item.tipos_refeicao?.nome || item.tipo_refeicao || '-',
        'Código': item.codigo_voucher || item.codigo || '-',
        'Valor': formatCurrency(item.tipos_refeicao?.valor || item.valor_refeicao || 0),
        'Turno': item.turno || '-',
        'Setor': item.nome_setor || item.setor || '-'
      };
    }) || [];

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(excelData);

    // Definir largura das colunas para vouchers descartáveis
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