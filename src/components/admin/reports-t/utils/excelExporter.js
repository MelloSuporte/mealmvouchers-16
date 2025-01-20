import * as XLSX from 'xlsx';
import logger from '@/config/logger';
import { formatCurrency, formatDate } from './formatters';

export const exportToExcel = (data) => {
  try {
    logger.info('Iniciando exportação Excel com dados:', data?.length || 0, 'registros');
    
    // Mapear dados para o formato do Excel
    const excelData = data?.map(item => {
      // Verificar se é um voucher descartável
      const isDisposable = item.tipo_voucher === 'descartavel';
      
      if (isDisposable) {
        return {
          'Data/Hora': formatDate(item.usado_em || item.data_uso),
          'Nome': item.nome_pessoa || '-',
          'Empresa': item.nome_empresa || '-',
          'Tipo Refeição': item.tipos_refeicao?.nome || '-',
          'Código': item.codigo || '-',
          'Valor': formatCurrency(item.tipos_refeicao?.valor || 0)
        };
      }
      
      // Retornar formato padrão para outros tipos de voucher
      return {
        'Data/Hora': formatDate(item.usado_em || item.data_uso),
        'Nome': item.nome_usuario || item.nome_pessoa || '-',
        'Empresa': item.nome_empresa || '-',
        'Tipo Refeição': item.tipo_refeicao || (item.tipos_refeicao?.nome) || '-',
        'Código': '-',
        'Valor': formatCurrency(item.valor_refeicao || item.tipos_refeicao?.valor || 0),
        'Turno': item.turno || '-',
        'Setor': item.setor || item.nome_setor || '-'
      };
    }) || [];

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(excelData);

    // Definir largura das colunas
    const wscols = [
      { wch: 20 }, // Data/Hora
      { wch: 30 }, // Nome
      { wch: 30 }, // Empresa
      { wch: 20 }, // Tipo Refeição
      { wch: 15 }, // Código
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