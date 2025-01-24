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
      'Código': item.codigo || '-',
      'Nome Pessoa': item.nome_pessoa || '-',
      'Empresa': item.nome_empresa || '-',
      'Tipo Refeição': item.tipos_refeicao?.nome || '-',
      'Data Requisição': item.data_requisicao ? format(new Date(item.data_requisicao), 'dd/MM/yyyy HH:mm', { locale: ptBR }) : '-',
      'Data Uso': item.data_uso ? format(new Date(item.data_uso), 'dd/MM/yyyy', { locale: ptBR }) : '-',
      'Valor': formatCurrency(item.tipos_refeicao?.valor || 0),
      'Solicitante': item.admin_users?.nome || '-'
    })) || [];

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(excelData);

    // Definir largura das colunas
    const wscols = [
      { wch: 15 }, // Código
      { wch: 35 }, // Nome Pessoa
      { wch: 35 }, // Empresa
      { wch: 25 }, // Tipo Refeição
      { wch: 20 }, // Data Requisição
      { wch: 20 }, // Data Uso
      { wch: 15 }, // Valor
      { wch: 35 }  // Solicitante
    ];

    ws['!cols'] = wscols;

    return { wb, ws };
  } catch (error) {
    logger.error('Erro ao preparar dados Excel:', error);
    throw error;
  }
};