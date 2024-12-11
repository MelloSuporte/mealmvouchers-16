import { toast } from "sonner";
import logger from '../../../config/logger';
import { supabase } from '../../../config/supabase';
import { formatCPF } from '../../../utils/formatters';
import { generateCommonVoucher } from '../../../utils/voucherGenerator';

export const useUserFormHandlers = (
  formData,
  setFormData,
  setIsSubmitting,
  setIsSearching
) => {
  const handleInputChange = (field, value) => {
    if (field === 'userCPF') {
      value = formatCPF(value);
      if (value.length === 14) {
        const newVoucher = generateCommonVoucher(value);
        setFormData(prev => ({
          ...prev,
          [field]: value,
          voucher: newVoucher
        }));
        return;
      }
    }
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSearch = async () => {
    if (!formData.userCPF) {
      toast.error('Por favor, informe um CPF para buscar');
      return;
    }

    setIsSearching(true);
    logger.info('Iniciando busca por CPF:', formData.userCPF);

    try {
      const cleanCPF = formData.userCPF.replace(/\D/g, '');
      const { data, error } = await supabase
        .from('usuarios')
        .select(`
          *,
          empresas (
            id,
            nome
          ),
          turnos (
            id,
            nome
          )
        `)
        .eq('cpf', cleanCPF)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          logger.info('Usuário não encontrado para CPF:', cleanCPF);
          const newVoucher = generateCommonVoucher(cleanCPF);
          setFormData(prev => ({
            ...prev,
            userCPF: formatCPF(cleanCPF),
            voucher: newVoucher
          }));
          toast.info('Usuário não encontrado. Voucher gerado automaticamente.');
        } else {
          logger.error('Erro na consulta:', error);
          toast.error('Erro ao buscar usuário');
        }
        return;
      }

      if (data) {
        logger.info('Usuário encontrado:', { id: data.id, nome: data.nome });
        setFormData({
          userName: data.nome,
          userCPF: formatCPF(data.cpf),
          company: data.empresa_id,
          selectedTurno: data.turno_id,
          selectedSetor: data.setor_id?.toString(),
          isSuspended: data.suspenso || false,
          userPhoto: data.foto || null,
          voucher: data.voucher || ''
        });
        toast.success('Usuário encontrado!');
      }
    } catch (error) {
      logger.error('Erro ao buscar usuário:', error);
      toast.error('Erro ao buscar usuário');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const cleanCPF = formData.userCPF.replace(/\D/g, '');
      
      const userData = {
        nome: formData.userName.trim(),
        cpf: cleanCPF,
        empresa_id: formData.company,
        setor_id: parseInt(formData.selectedSetor),
        turno_id: formData.selectedTurno,
        suspenso: formData.isSuspended,
        foto: formData.userPhoto,
        voucher: formData.voucher.trim()
      };

      logger.info('Tentando salvar usuário:', userData);

      const { error } = await supabase
        .from('usuarios')
        .upsert(userData)
        .select()
        .single();

      if (error) throw error;

      toast.success('Usuário salvo com sucesso!');
      
      // Limpar formulário após salvar
      setFormData({
        userName: '',
        userCPF: '',
        company: '',
        selectedTurno: '',
        selectedSetor: '',
        isSuspended: false,
        userPhoto: null,
        voucher: ''
      });
      
    } catch (error) {
      logger.error('Erro ao salvar usuário:', error);
      toast.error(`Erro ao salvar usuário: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePhotoUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      handleInputChange('userPhoto', file);
    }
  };

  return {
    handleInputChange,
    handleSearch,
    handleSave,
    handlePhotoUpload
  };
};