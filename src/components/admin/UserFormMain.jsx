import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from "sonner";
import { supabase } from '../../config/supabase';
import UserFormFields from './user/UserFormFields';
import UserSearchSection from './user/UserSearchSection';
import { useVoucherVisibility } from '../../hooks/useVoucherVisibility';
import logger from '../../config/logger';
import { formatCPF } from '../../utils/formatters';
import { generateCommonVoucher } from '../../utils/voucherGenerator';
import { useUserFormState } from './user/useUserFormState';
import { useUserFormHandlers } from './user/useUserFormHandlers';

const UserFormMain = () => {
  const {
    formData,
    setFormData,
    searchCPF,
    setSearchCPF,
    isSearching,
    setIsSearching,
    isSubmitting,
    setIsSubmitting
  } = useUserFormState();

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
    const cleanCPF = searchCPF.replace(/\D/g, '');
    logger.info('Iniciando busca por CPF:', cleanCPF);

    try {
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
          ),
          setores (
            id,
            nome_setor
          )
        `)
        .eq('cpf', cleanCPF)
        .maybeSingle();

      if (error) {
        logger.error('Erro na busca por CPF:', error);
        toast.error('Erro ao buscar usuário');
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
          userPhoto: data.foto,
          voucher: data.voucher || ''
        });
        toast.success('Usuário encontrado!');
      } else {
        logger.info('Usuário não encontrado para CPF:', cleanCPF);
        const newVoucher = generateCommonVoucher(cleanCPF);
        setFormData(prev => ({
          ...prev,
          userCPF: formatCPF(cleanCPF),
          voucher: newVoucher
        }));
        toast.info('Usuário não encontrado. Novo voucher gerado.');
      }
    } catch (error) {
      logger.error('Erro ao buscar usuário:', error);
      toast.error('Erro ao buscar usuário');
    } finally {
      setIsSearching(false);
    }
  };

  const {
    handleInputChange,
    handleSave,
    handlePhotoUpload
  } = useUserFormHandlers(
    formData,
    setFormData,
    setIsSubmitting,
    setIsSearching,
    handleVoucherToggle
  );

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