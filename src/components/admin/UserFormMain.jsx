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

  const handleSearch = async () => {
    if (!searchCPF) {
      toast.error('Por favor, informe um CPF para buscar');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select(`
          *,
          empresas (id, name),
          turnos (id, tipo_turno)
        `)
        .eq('cpf', searchCPF.replace(/\D/g, ''))
        .single();

      if (error) {
        throw error;
      }

      if (data) {
        onInputChange('userName', data.nome);
        onInputChange('userCPF', searchCPF);
        onInputChange('company', data.empresa_id.toString());
        onInputChange('selectedTurno', data.turnos.tipo_turno);
        onInputChange('isSuspended', data.suspenso);
        onInputChange('userPhoto', data.foto);
        toast.success('Usuário encontrado!');
      } else {
        toast.error('Usuário não encontrado');
      }
    } catch (error) {
      console.error('Erro ao buscar usuário:', error);
      toast.error('Erro ao buscar usuário');
    }
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

  return (
    <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
      <div className="space-y-2">
        <Label>Pesquisar usuário existente (opcional)</Label>
        <UserSearchSection 
          searchCPF={searchCPF}
          setSearchCPF={setSearchCPF}
          onSearch={handleSearch}
        />
      </div>
      
      <UserBasicInfo 
        formData={formData}
        onInputChange={onInputChange}
      />

      <CompanySelect 
        value={formData.company}
        onValueChange={(value) => onInputChange('company', value)}
      />

      <VoucherInput 
        voucher={formData.voucher}
        showVoucher={showVoucher}
        onToggleVoucher={() => setShowVoucher(!showVoucher)}
      />

      <TurnoSelect 
        value={formData.selectedTurno}
        onValueChange={(value) => onInputChange('selectedTurno', value)}
        turnos={turnos}
        isLoadingTurnos={isLoadingTurnos}
      />

      <div className="flex items-center space-x-2">
        <Switch
          id="suspend-user"
          checked={formData.isSuspended}
          onCheckedChange={(checked) => onInputChange('isSuspended', checked)}
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
        />
        <div className="flex space-x-4">
          <Button type="button" onClick={() => document.getElementById('photo-upload').click()}>
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