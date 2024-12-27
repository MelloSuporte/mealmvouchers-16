export const VOUCHER_TYPES = {
  COMUM: 'comum',
  EXTRA: 'extra',
  DESCARTAVEL: 'descartavel'
};

export const getVoucherTypeLabel = (type) => {
  switch (type) {
    case VOUCHER_TYPES.COMUM:
      return 'Voucher Comum';
    case VOUCHER_TYPES.EXTRA:
      return 'Voucher Extra';
    case VOUCHER_TYPES.DESCARTAVEL:
      return 'Voucher Descartável';
    default:
      return 'Tipo Desconhecido';
  }
};