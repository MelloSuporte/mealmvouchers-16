import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from "sonner";
import { supabase } from '@/config/supabase';
import UserFormFields from './user/UserFormFields';
import { useVoucherVisibility } from '../../hooks/useVoucherVisibility';

const UserFormMain = ({
  formData,
  onInputChange,
  onSave,
  isSubmitting
}) => {
  const [searchCPF, setSearchCPF] = React.useState('');
  const [isSearching, setIsSearching] = React.useState(false);
  const { showVoucher, handleVoucherToggle } = useVoucherVisibility();

  const handleSearch = async () => {
    if (!searchCPF) {
      toast.error('Por favor, informe um CPF para buscar');
      return;
    }

    setIsSearching(true);

    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('cpf', searchCPF.replace(/\D/g, ''))
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          toast.info('Usuário não encontrado');
        } else {
          throw error;
        }
        return;
      }

      if (data) {
        onInputChange('userName', data.nome);
        onInputChange('userCPF', searchCPF);
        onInputChange('company', data.empresa_id.toString());
        onInputChange('selectedTurno', data.turno_id.toString());
        onInputChange('isSuspended', data.suspenso);
        onInputChange('userPhoto', data.foto);
        onInputChange('voucher', data.voucher);
        toast.success('Usuário encontrado!');
      }
    } catch (error) {
      console.error('Erro ao buscar usuário:', error);
      toast.error('Erro ao buscar usuário. Por favor, tente novamente.');
    } finally {
      setIsSearching(false);
    }
  };

  const { data: turnosData, isLoading: isLoadingTurnos } = useQuery({
    queryKey: ['turnos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('turnos')
        .select('*')
        .eq('ativo', true)
        .order('id');

      if (error) throw error;
      return data || [];
    }
  });

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
        turnos={turnosData}
        isLoadingTurnos={isLoadingTurnos}
      />
    </div>
  );
};

export default UserFormMain;