import React from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import CompanySelect from './CompanySelect';
import TurnoSelect from './TurnoSelect';
import { Upload } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/config/supabase';
import { toast } from 'sonner';

const UserFormFields = ({
  formData,
  onInputChange,
  onSave,
  isSubmitting,
  searchCPF,
  setSearchCPF,
  onSearch,
  isSearching,
  showVoucher,
  onToggleVoucher,
  handlePhotoUpload
}) => {
  const { data: turnos, isLoading: isLoadingTurnos } = useQuery({
    queryKey: ['turnos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('turnos')
        .select('*')
        .eq('ativo', true)
        .order('id');

      if (error) {
        toast.error('Erro ao carregar turnos');
        throw error;
      }

      return data || [];
    }
  });

  return (
    <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
      <div className="space-y-2">
        <Label htmlFor="userName" className="required">Nome Completo</Label>
        <Input
          id="userName"
          value={formData.userName}
          onChange={(e) => onInputChange('userName', e.target.value)}
          placeholder="Digite o nome completo"
          required
          className={!formData.userName.trim() ? 'border-red-500' : ''}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="userCPF" className="required">CPF</Label>
        <Input
          id="userCPF"
          value={formData.userCPF}
          onChange={(e) => onInputChange('userCPF', e.target.value)}
          placeholder="000.000.000-00"
          required
          className={!formData.userCPF.trim() ? 'border-red-500' : ''}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="company" className="required">Empresa</Label>
        <CompanySelect
          value={formData.company}
          onValueChange={(value) => onInputChange('company', value)}
          required
          className={!formData.company ? 'border-red-500' : ''}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="turno" className="required">Turno</Label>
        <TurnoSelect
          value={formData.selectedTurno}
          onValueChange={(value) => onInputChange('selectedTurno', value)}
          turnos={turnos}
          isLoadingTurnos={isLoadingTurnos}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="voucher" className="required">Voucher</Label>
        <Input
          id="voucher"
          value={formData.voucher}
          onChange={(e) => onInputChange('voucher', e.target.value)}
          placeholder="Digite o voucher"
          required
          className={!formData.voucher.trim() ? 'border-red-500' : ''}
        />
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="suspend-user"
          checked={formData.isSuspended}
          onCheckedChange={(checked) => onInputChange('isSuspended', checked)}
        />
        <Label htmlFor="suspend-user">Suspender acesso do usuário</Label>
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
          <Button 
            type="button" 
            variant="outline"
            onClick={() => document.getElementById('photo-upload').click()}
          >
            <Upload size={20} className="mr-2" />
            Enviar Foto
          </Button>
          <Button 
            type="button" 
            onClick={onSave}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Processando...' : 'Salvar Usuário'}
          </Button>
        </div>
        {formData.userPhoto && (
          <img 
            src={typeof formData.userPhoto === 'string' ? formData.userPhoto : URL.createObjectURL(formData.userPhoto)} 
            alt="Foto do usuário" 
            className="w-10 h-10 rounded-full object-cover" 
          />
        )}
      </div>
    </form>
  );
};

export default UserFormFields;