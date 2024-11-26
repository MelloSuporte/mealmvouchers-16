import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from "sonner";
import { supabase } from '../../config/supabase';
import UserFormFields from './user/UserFormFields';
import { useVoucherVisibility } from '../../hooks/useVoucherVisibility';
import logger from '../../config/logger';

const UserFormMain = () => {
  const [formData, setFormData] = React.useState({
    userName: '',
    userCPF: '',
    company: '',
    selectedTurno: '',
    isSuspended: false,
    userPhoto: null,
    voucher: ''
  });

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [searchCPF, setSearchCPF] = React.useState('');
  const [isSearching, setIsSearching] = React.useState(false);
  const { showVoucher, handleVoucherToggle } = useVoucherVisibility();

  const { data: turnos, isLoading: isLoadingTurnos } = useQuery({
    queryKey: ['turnos'],
    queryFn: async () => {
      logger.info('Buscando turnos ativos...');
      const { data, error } = await supabase
        .from('turnos')
        .select('*')
        .eq('ativo', true)
        .order('id');

      if (error) {
        logger.error('Erro ao carregar turnos:', error);
        toast.error('Erro ao carregar turnos');
        throw error;
      }

      logger.info(`${data?.length || 0} turnos encontrados`);
      return data || [];
    }
  });

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
        .select('*')
        .eq('cpf', cleanCPF)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          logger.info('Usuário não encontrado para CPF:', cleanCPF);
          toast.info('Usuário não encontrado');
        } else {
          logger.error('Erro na consulta:', error);
          toast.error('Erro ao buscar usuário. Por favor, tente novamente.');
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
      toast.error('Erro ao buscar usuário. Por favor, tente novamente.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePhotoUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      handleInputChange('userPhoto', file);
    }
  };

  const handleSave = async () => {
    if (isSubmitting) {
      toast.warning('Uma operação já está em andamento');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Add save logic here
      console.log('Salvando usuário:', formData);
    } catch (error) {
      logger.error('Erro ao salvar usuário:', error);
      toast.error('Erro ao salvar usuário. Por favor, tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <UserFormFields
        formData={formData}
        onInputChange={handleInputChange}
        onSave={handleSave}
        isSubmitting={isSubmitting}
        searchCPF={searchCPF}
        setSearchCPF={setSearchCPF}
        onSearch={handleSearch}
        isSearching={isSearching}
        showVoucher={showVoucher}
        onToggleVoucher={handleVoucherToggle}
        handlePhotoUpload={handlePhotoUpload}
        turnos={turnos}
        isLoadingTurnos={isLoadingTurnos}
      />
    </div>
  );
};

export default UserFormMain;