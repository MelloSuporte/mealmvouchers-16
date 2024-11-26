import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from "sonner";
import { supabase } from '@/config/supabase';
import UserFormFields from './user/UserFormFields';
import { useVoucherVisibility } from '../../hooks/useVoucherVisibility';
import logger from '../../config/logger';

const UserFormMain = ({
  formData,
  onInputChange,
  onSave,
  isSubmitting
}) => {
  const [searchCPF, setSearchCPF] = React.useState('');
  const [isSearching, setIsSearching] = React.useState(false);
  const { showVoucher, handleVoucherToggle } = useVoucherVisibility();

  const { data: turnos, isLoading: isLoadingTurnos } = useQuery({
    queryKey: ['turnos'],
    queryFn: async () => {
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
        onInputChange('userName', data.nome);
        onInputChange('userCPF', searchCPF);
        onInputChange('company', data.empresa_id?.toString() || '');
        onInputChange('selectedTurno', data.turno_id?.toString() || '');
        onInputChange('isSuspended', data.suspenso || false);
        onInputChange('userPhoto', data.foto || null);
        onInputChange('voucher', data.voucher || '');
        toast.success('Usuário encontrado!');
      }
    } catch (error) {
      logger.error('Erro ao buscar usuário:', error);
      toast.error('Erro ao buscar usuário. Por favor, tente novamente.');
    } finally {
      setIsSearching(false);
    }
  };

  const handlePhotoUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      onInputChange('userPhoto', file);
    }
  };

  const clearSearch = () => {
    setSearchCPF('');
    setIsSearching(false);
    onInputChange('userName', '');
    onInputChange('userCPF', '');
    onInputChange('company', '');
    onInputChange('selectedTurno', '');
    onInputChange('isSuspended', false);
    onInputChange('userPhoto', null);
    onInputChange('voucher', '');
  };

  return (
    <div className="space-y-4">
      <UserFormFields
        formData={formData}
        onInputChange={onInputChange}
        onSave={onSave}
        isSubmitting={isSubmitting}
        searchCPF={searchCPF}
        setSearchCPF={setSearchCPF}
        onSearch={handleSearch}
        isSearching={isSearching}
        clearSearch={clearSearch}
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