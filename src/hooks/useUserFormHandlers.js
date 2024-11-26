import { toast } from "sonner";
import logger from '../config/logger';
import { validateUserData } from './user/useUserValidation';
import { saveUserToDatabase, findUserByCPF } from './user/useUserDatabase';
import { generateUniqueVoucherFromCPF } from '../utils/voucherGenerationUtils';
import { supabase } from '../config/supabase';

export const useUserFormHandlers = (
  formData,
  setFormData,
  setIsSubmitting,
  setIsSearching,
  setShowVoucher
) => {
  const handleInputChange = async (field, value) => {
    let processedValue = value;
    
    if (field === 'userCPF') {
      processedValue = value.replace(/\D/g, '').replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
      try {
        if (processedValue.length === 14) {
          const voucher = await generateUniqueVoucherFromCPF(processedValue);
          setFormData(prev => ({
            ...prev,
            [field]: processedValue,
            voucher
          }));
          return;
        }
      } catch (error) {
        logger.error('Erro ao gerar voucher:', error);
        toast.error('Erro ao gerar voucher automático');
      }
    }
    
    setFormData(prev => ({
      ...prev,
      [field]: processedValue
    }));
  };

  const handleVoucherToggle = () => {
    setShowVoucher(prev => !prev);
  };

  const handleSearch = async (searchCPF) => {
    if (!searchCPF) {
      toast.error('Por favor, informe um CPF para buscar');
      return;
    }

    setIsSearching(true);
    logger.info('Iniciando busca por CPF:', searchCPF);

    try {
      const cleanCPF = searchCPF.replace(/\D/g, '');
      const data = await findUserByCPF(cleanCPF);

      if (data) {
        logger.info('Usuário encontrado:', { id: data.id, nome: data.nome });
        setFormData({
          userName: data.nome,
          userCPF: searchCPF,
          company: data.empresa_id, // Mantém o UUID original
          selectedTurno: data.turno_id?.toString() || '',
          isSuspended: data.suspenso || false,
          userPhoto: data.foto || null,
          voucher: data.voucher || ''
        });
        toast.success('Usuário encontrado!');
      } else {
        logger.info('Usuário não encontrado para CPF:', cleanCPF);
        toast.info('Usuário não encontrado');
      }
    } catch (error) {
      logger.error('Erro ao buscar usuário:', error);
      toast.error('Erro ao buscar usuário');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSave = async () => {
    if (setIsSubmitting) {
      setIsSubmitting(true);
    }

    try {
      const validationErrors = validateUserData(formData);
      if (validationErrors.length > 0) {
        validationErrors.forEach(error => toast.error(error));
        return;
      }

      const cleanCPF = formData.userCPF.replace(/\D/g, '');
      
      const userData = {
        nome: formData.userName.trim(),
        cpf: cleanCPF,
        empresa_id: formData.company, // Mantém o UUID original
        voucher: formData.voucher.trim(),
        turno_id: formData.selectedTurno,
        suspenso: formData.isSuspended,
        foto: formData.userPhoto
      };

      logger.info('Dados para salvar:', userData);

      const { data, error } = await saveUserToDatabase(userData);

      if (error) throw error;

      toast.success(data.id ? 'Usuário atualizado com sucesso!' : 'Usuário cadastrado com sucesso!');
      
      setFormData({
        userName: '',
        userCPF: '',
        company: '',
        selectedTurno: '',
        isSuspended: false,
        userPhoto: null,
        voucher: ''
      });
      
    } catch (error) {
      logger.error('Erro ao processar operação:', error);
      toast.error(`Erro ao processar operação: ${error.message}`);
    } finally {
      if (setIsSubmitting) {
        setIsSubmitting(false);
      }
    }
  };

  return {
    handleInputChange,
    handleVoucherToggle,
    handleSearch,
    handleSave
  };
};