import * as XLSX from 'xlsx';
import logger from '@/config/logger';
import { formatCurrency, formatDate } from './formatters';

export const exportToExcel = (data, filters) => {
  try {
    logger.info('Iniciando exportação Excel com dados:', {
      totalRegistros: data?.length || 0,
      filtros: filters
    });
    
    // Filtrar dados baseado no tipo de voucher
    const filteredData = data?.filter(item => {
      if (filters?.voucherType === 'descartavel') {
        return item.tipo_voucher === 'descartavel';
      }
      return item.tipo_voucher === 'comum';
    }) || [];

    logger.info('Dados filtrados:', {
      totalFiltrado: filteredData.length,
      tipoVoucher: filters?.voucherType
    });

    // Mapear dados para o formato do Excel
    const excelData = filteredData.map(item => {
      // Formato específico para vouchers descartáveis
      if (filters?.voucherType === 'descartavel') {
        return {
          'Data/Hora': formatDate(item.usado_em || item.data_uso),
          'Pessoa': item.nome_pessoa || item.nome_usuario || '-',
          'Refeição': item.tipos_refeicao?.nome || item.tipo_refeicao || '-',
          'Valor': formatCurrency(item.tipos_refeicao?.valor || item.valor_refeicao || 0),
          'Código': item.codigo || item.codigo_voucher || '-',
          'Empresa': item.nome_empresa || '-'
        };
      }
      
      // Formato para vouchers comuns
      return {
        'Data/Hora': formatDate(item.data_uso || item.usado_em),
        'Nome': item.nome_usuario || item.nome_pessoa || '-',
        'Empresa': item.nome_empresa || '-',
        'Tipo Refeição': item.tipo_refeicao || (item.tipos_refeicao?.nome) || '-',
        'Código': item.codigo_voucher || item.codigo || '-',
        'Valor': formatCurrency(item.valor_refeicao || item.tipos_refeicao?.valor || 0),
        'Turno': item.turno || '-',
        'Setor': item.setor || item.nome_setor || '-'
      };
    });

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(excelData);

    // Definir largura das colunas baseado no tipo de voucher
    const wscols = filters?.voucherType === 'descartavel' ? [
      { wch: 25 }, // Data/Hora
      { wch: 35 }, // Pessoa
      { wch: 25 }, // Refeição
      { wch: 20 }, // Valor
      { wch: 20 }, // Código
      { wch: 30 }  // Empresa
    ] : [
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

    logger.info('Exportação Excel concluída:', {
      registrosProcessados: excelData.length,
      tipoVoucher: filters?.voucherType
    });

    return { wb, ws };
  } catch (error) {
    logger.error('Erro ao preparar dados Excel:', error);
    throw error;
  }
};