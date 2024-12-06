export const generateCommonVoucher = (cpf) => {
  if (!cpf) return '';
  
  // Remove caracteres não numéricos do CPF
  const cleanCPF = cpf.replace(/\D/g, '');
  
  if (cleanCPF.length !== 11) return '';

  // Pega os dígitos do CPF (posições 2-11)
  const cpfDigits = cleanCPF.slice(1);
  
  // Soma os dígitos do CPF
  const sum = cpfDigits.split('').reduce((acc, digit) => acc + parseInt(digit), 0);
  
  // Usa timestamp para garantir aleatoriedade
  const timestamp = Date.now() % 10000;
  
  // Combina a soma dos dígitos com o timestamp
  let voucher = ((sum * timestamp) % 9000 + 1000).toString();
  
  // Garante que tenha 4 dígitos e não comece com 0
  while (voucher.length < 4 || voucher.startsWith('0')) {
    voucher = (parseInt(voucher) + 1000).toString();
  }
  
  return voucher;
};