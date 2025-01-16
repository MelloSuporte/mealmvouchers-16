import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const formatCurrency = (value) => {
  if (!value || isNaN(value)) return 'R$ 0,00';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

export const formatDate = (date) => {
  if (!date) return '-';
  try {
    return format(new Date(date), "dd/MM/yyyy HH:mm", { locale: ptBR });
  } catch (error) {
    console.error('Erro ao formatar data:', error);
    return '-';
  }
};

export const getFileName = () => {
  return `relatorio-vouchers-${format(new Date(), 'dd-MM-yyyy-HH-mm', { locale: ptBR })}`;
};