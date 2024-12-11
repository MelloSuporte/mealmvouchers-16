import { supabase } from '../../config/supabase';
import logger from '../../config/logger';
import { toast } from "sonner";
import { validateUserData } from './useUserValidation';

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
      if (processedValue.length === 14) {
        setFormData(prev => ({
          ...prev,
          [field]: processedValue,
        }));
        return;
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
          ),
          setores (
            id,
            nome_setor
          )
        `)
        .eq('cpf', cleanCPF)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        logger.info('Usuário encontrado:', { id: data.id, nome: data.nome });
        setFormData({
          userName: data.nome,
          userCPF: searchCPF,
          company: data.empresa_id,
          selectedTurno: data.turno_id,
          selectedSetor: data.setor_id?.toString(),
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

  const handleSave = async (e) => {
    e.preventDefault();
    
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
        empresa_id: formData.company,
        setor_id: parseInt(formData.selectedSetor),
        turno_id: parseInt(formData.selectedTurno),
        suspenso: formData.isSuspended,
        foto: formData.userPhoto,
        voucher: formData.voucher.trim()
      };

      logger.info('Tentando salvar usuário:', userData);

      // First check if user exists
      const { data: existingUser } = await supabase
        .from('usuarios')
        .select('id')
        .eq('cpf', cleanCPF)
        .single();

      let result;
      
      if (existingUser) {
        // Update existing user
        result = await supabase
          .from('usuarios')
          .update(userData)
          .eq('id', existingUser.id)
          .select()
          .single();
      } else {
        // Insert new user
        result = await supabase
          .from('usuarios')
          .insert([userData])
          .select()
          .single();
      }

      if (result.error) throw result.error;

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