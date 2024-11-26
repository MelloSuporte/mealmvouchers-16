import { useState } from 'react';
import { toast } from "sonner";
import { supabase } from '../config/supabase';
import logger from '../config/logger';
import { validateUserData, formatCPF } from '../utils/userValidations';

export const useUserForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchCPF, setSearchCPF] = useState('');
  const [showVoucher, setShowVoucher] = useState(true);
  const [formData, setFormData] = useState({
    userName: '',
    userCPF: '',
    company: '',
    selectedTurno: '',
    isSuspended: false,
    userPhoto: null,
    voucher: ''
  });

  const handleInputChange = (field, value) => {
    let processedValue = value;
    
    if (field === 'userCPF') {
      processedValue = formatCPF(value);
    }
    
    setFormData(prev => ({
      ...prev,
      [field]: processedValue
    }));
  };

  const handleVoucherToggle = () => {
    setShowVoucher(prev => !prev);
  };

  const handleSearch = async () => {
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

  const resetForm = () => {
    setFormData({
      userName: '',
      userCPF: '',
      company: '',
      selectedTurno: '',
      isSuspended: false,
      userPhoto: null,
      voucher: ''
    });
  };

  const handleSave = async () => {
    if (isSubmitting) {
      toast.warning('Uma operação já está em andamento');
      return;
    }

    const validationErrors = validateUserData(formData);
    if (validationErrors.length > 0) {
      validationErrors.forEach(error => toast.error(error));
      return;
    }

    setIsSubmitting(true);
    
    try {
      const cleanCPF = formData.userCPF.replace(/\D/g, '');
      
      logger.info('Iniciando verificação de usuário existente:', { cpf: cleanCPF });
      
      const { data: existingUser, error: searchError } = await supabase
        .from('usuarios')
        .select('id')
        .eq('cpf', cleanCPF)
        .maybeSingle();

      if (searchError) {
        logger.error('Erro ao verificar usuário existente:', searchError);
        throw new Error('Erro ao verificar usuário existente');
      }

      const userData = {
        nome: formData.userName.trim(),
        cpf: cleanCPF,
        empresa_id: parseInt(formData.company),
        voucher: formData.voucher.trim(),
        turno_id: parseInt(formData.selectedTurno),
        suspenso: formData.isSuspended,
        foto: formData.userPhoto
      };

      logger.info('Dados preparados para operação:', userData);

      const operation = existingUser?.id ? 'update' : 'insert';
      
      logger.info(`Iniciando operação ${operation}:`, userData);

      let query = supabase.from('usuarios');
      
      if (operation === 'update') {
        query = query.update(userData).eq('id', existingUser.id);
      } else {
        query = query.insert(userData);
      }

      const { data, error } = await query.select().single();

      if (error) {
        logger.error(`Erro na operação ${operation}:`, error);
        throw error;
      }

      logger.info(`Usuário ${operation === 'update' ? 'atualizado' : 'cadastrado'} com sucesso:`, {
        id: data.id,
        nome: data.nome
      });

      toast.success(existingUser?.id ? 
        'Usuário atualizado com sucesso!' : 
        'Usuário cadastrado com sucesso!'
      );
      
      resetForm();
      
    } catch (error) {
      logger.error('Erro ao processar operação:', error);
      toast.error(`Erro ao processar operação: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    formData,
    isSubmitting,
    searchCPF,
    setSearchCPF,
    handleSearch,
    isSearching,
    handleInputChange,
    handleSave,
    showVoucher,
    handleVoucherToggle
  };
};