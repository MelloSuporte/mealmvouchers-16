import { toast } from "sonner";
import logger from '../config/logger';
import { validateUserData, handleValidationErrors } from './user/useUserValidation';
import { saveUserToDatabase, findUserByCPF } from './user/useUserDatabase';
import { generateUniqueVoucherFromCPF } from '../utils/voucherGenerationUtils';

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
            tipo_turno,
            horario_inicio,
            horario_fim
          )
        `)
        .eq('cpf', cleanCPF)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          logger.info('Usuário não encontrado para CPF:', cleanCPF);
          toast.info('Usuário não encontrado');
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
          userCPF: searchCPF,
          company: data.empresa_id?.toString() || '',
          selectedTurno: data.turno_id?.toString() || '',
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

  const handleSave = async () => {
    if (setIsSubmitting) {
      setIsSubmitting(true);
    }

    try {
      const validationErrors = validateUserData(formData);
      if (!handleValidationErrors(validationErrors)) {
        return;
      }

      const cleanCPF = formData.userCPF.replace(/\D/g, '');
      const existingUser = await findUserByCPF(cleanCPF);

      const userData = {
        nome: formData.userName.trim(),
        cpf: cleanCPF,
        empresa_id: parseInt(formData.company),
        voucher: formData.voucher.trim(),
        turno_id: parseInt(formData.selectedTurno),
        suspenso: formData.isSuspended,
        foto: formData.userPhoto
      };

      const { data, error } = await saveUserToDatabase(userData, !!existingUser);

      if (error) throw error;

      toast.success(existingUser ? 
        'Usuário atualizado com sucesso!' : 
        'Usuário cadastrado com sucesso!'
      );
      
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