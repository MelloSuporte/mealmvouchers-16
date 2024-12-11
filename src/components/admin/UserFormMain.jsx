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

const UserFormMain = () => {
  const [formData, setFormData] = React.useState({
    userName: '',
    userCPF: '',
    company: '',
    selectedTurno: '',
    selectedSetor: '',
    isSuspended: false,
    userPhoto: null,
    voucher: ''
  });

  const [searchCPF, setSearchCPF] = React.useState('');
  const [isSearching, setIsSearching] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
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

  const handlePhotoUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      handleInputChange('userPhoto', file);
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
        .upsert(userData, {
          onConflict: 'cpf',
          returning: 'minimal'
        });

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