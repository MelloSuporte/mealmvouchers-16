export const formatCPF = (value) => {
  if (!value) return '';
  
  // Remove tudo que não for número
  const cleaned = value.replace(/\D/g, '');
  
  // Limita a 11 dígitos
  const truncated = cleaned.slice(0, 11);
  
  // Aplica a máscara se tiver 11 dígitos
  if (truncated.length === 11) {
    return truncated.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }
  
  // Se não tiver 11 dígitos, retorna apenas os números
  return truncated;
};