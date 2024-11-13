import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Upload } from 'lucide-react';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from '@/config/supabase';
import UserSearchSection from './user/UserSearchSection';
import UserBasicInfo from './user/UserBasicInfo';
import CompanySelect from './user/CompanySelect';
import VoucherInput from './user/VoucherInput';
import TurnoSelect from './user/TurnoSelect';

const UserFormMain = ({
  formData,
  onInputChange,
  onSave,
  isSubmitting
}) => {
  const [showVoucher, setShowVoucher] = React.useState(false);
  const [searchCPF, setSearchCPF] = React.useState('');
  const [isSearching, setIsSearching] = React.useState(false);

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
        throw error;
      }

      if (data) {
        onInputChange('userName', data.nome);
        onInputChange('userCPF', searchCPF);
        onInputChange('company', data.empresa_id.toString());
        onInputChange('selectedTurno', data.turno_id.toString());
        onInputChange('isSuspended', data.suspenso);
        onInputChange('userPhoto', data.foto);
        onInputChange('voucher', data.voucher); // Adicionando o voucher aos dados do formulário
        toast.success('Usuário encontrado!');
      } else {
        toast.error('Usuário não encontrado');
        setIsSearching(false);
      }
    } catch (error) {
      console.error('Erro ao buscar usuário:', error);
      toast.error('Erro ao buscar usuário');
      setIsSearching(false);
    }
  };

  const handleVoucherToggle = (value) => {
    setShowVoucher(value);
  };

  const { data: turnosData, isLoading: isLoadingTurnos } = useQuery({
    queryKey: ['turnos'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('turnos')
          .select('*')
          .eq('ativo', true)
          .order('id');

        if (error) {
          console.error('Erro ao buscar turnos:', error);
          toast.error('Erro ao carregar turnos');
          throw error;
        }
        return data || [];
      } catch (error) {
        console.error('Erro ao carregar turnos:', error);
        toast.error('Erro ao carregar turnos');
        return [];
      }
    }
  });

  const turnos = Array.isArray(turnosData) ? turnosData : [];

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
    onInputChange('voucher', ''); // Limpando o voucher ao limpar a busca
  };

  return (
    <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
      <div className="space-y-2">
        <Label>Pesquisar usuário existente</Label>
        <div className="flex gap-2">
          <UserSearchSection 
            searchCPF={searchCPF}
            setSearchCPF={setSearchCPF}
            onSearch={handleSearch}
          />
          {isSearching && (
            <Button type="button" variant="outline" onClick={clearSearch}>
              Limpar Busca
            </Button>
          )}
        </div>
      </div>
      
      <UserBasicInfo 
        formData={formData}
        onInputChange={onInputChange}
        disabled={isSearching}
      />

      <CompanySelect 
        value={formData.company}
        onValueChange={(value) => onInputChange('company', value)}
        disabled={isSearching}
      />

      <VoucherInput 
        voucher={formData.voucher}
        showVoucher={showVoucher}
        onToggleVoucher={handleVoucherToggle}
        disabled={isSearching}
      />

      <TurnoSelect 
        value={formData.selectedTurno}
        onValueChange={(value) => onInputChange('selectedTurno', value)}
        turnos={turnos}
        isLoadingTurnos={isLoadingTurnos}
        disabled={isSearching}
      />

      <div className="flex items-center space-x-2">
        <Switch
          id="suspend-user"
          checked={formData.isSuspended}
          onCheckedChange={(checked) => onInputChange('isSuspended', checked)}
          disabled={isSearching}
        />
        <Label htmlFor="suspend-user">Suspender acesso</Label>
      </div>

      <div className="flex items-center justify-between space-x-4">
        <input
          type="file"
          accept="image/*"
          onChange={handlePhotoUpload}
          className="hidden"
          id="photo-upload"
          disabled={isSearching}
        />
        <div className="flex space-x-4">
          <Button 
            type="button" 
            onClick={() => document.getElementById('photo-upload').click()}
            disabled={isSearching}
          >
            <Upload size={20} className="mr-2" />
            Upload Foto
          </Button>
          <Button 
            type="button" 
            onClick={onSave}
            disabled={isSubmitting}
          >
            {formData.userCPF ? 'Atualizar Usuário' : 'Cadastrar Usuário'}
          </Button>
        </div>
        {formData.userPhoto && (
          <img 
            src={typeof formData.userPhoto === 'string' ? formData.userPhoto : URL.createObjectURL(formData.userPhoto)} 
            alt="User" 
            className="w-10 h-10 rounded-full object-cover" 
          />
        )}
      </div>
    </form>
  );
};

export default UserFormMain;
