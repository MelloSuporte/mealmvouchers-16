import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from "sonner";
import { supabase } from '../../config/supabase';
import UserFormFields from './user/UserFormFields';
import UserSearchSection from './user/UserSearchSection';
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

  const formatCPF = (cpf) => {
    const cleaned = cpf.replace(/\D/g, '');
    if (cleaned.length <= 11) {
      return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }
    return cpf;
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
          toast.error('Erro ao buscar usuário. Por favor, tente novamente.');
        }
        return;
      }

      if (data) {
        logger.info('Usuário encontrado:', { id: data.id, nome: data.nome });
        setFormData({
          userName: data.nome,
          userCPF: formatCPF(data.cpf),
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
    if (field === 'userCPF') {
      value = formatCPF(value);
    }
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
    // Salvar lógica de usuário
    // ... código para salvar o usuário (não alterado)
  };

  return (
    <div className="space-y-4">
      <UserSearchSection 
        searchCPF={searchCPF}
        setSearchCPF={setSearchCPF}
        onSearch={handleSearch}
        isSearching={isSearching}
      />
      <UserFormFields
        formData={formData}
        onInputChange={handleInputChange}
        onSave={handleSave}
        isSubmitting={isSearching}
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