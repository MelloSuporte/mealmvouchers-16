import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Upload } from 'lucide-react';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import api from '../../utils/api';
import UserSearchSection from './user/UserSearchSection';
import UserBasicInfo from './user/UserBasicInfo';
import CompanySelect from './user/CompanySelect';

const UserFormMain = ({
  formData,
  onInputChange,
  onSave
}) => {
  const [showVoucher, setShowVoucher] = React.useState(false);
  const [searchCPF, setSearchCPF] = React.useState('');

  const { data: turnosData, isLoading: isLoadingTurnos } = useQuery({
    queryKey: ['turnos'],
    queryFn: async () => {
      try {
        const response = await api.get('/turnos');
        if (!response.data) {
          throw new Error('Dados dos turnos não encontrados');
        }
        return response.data;
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

  const handleSearch = async () => {
    if (!searchCPF) {
      toast.error('Por favor, digite um CPF para pesquisar');
      return;
    }

    try {
      const response = await api.get(`/usuarios/search?cpf=${searchCPF}`);
      if (response.data) {
        const userData = response.data;
        onInputChange('userName', userData.nome);
        onInputChange('userCPF', userData.cpf);
        onInputChange('empresa_id', userData.empresa_id?.toString());
        onInputChange('voucher', userData.voucher);
        onInputChange('selectedTurno', userData.turno);
        onInputChange('isSuspended', userData.suspenso);
        onInputChange('userPhoto', userData.foto);
        toast.success('Usuário encontrado!');
      }
    } catch (error) {
      toast.error('Usuário não encontrado ou erro na busca');
    }
  };

  const handleCPFChange = async (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length <= 11) {
      value = value.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, "$1.$2.$3-$4");
      onInputChange('userCPF', value);
      
      if (value.length >= 11) {
        const newVoucher = await generateUniqueVoucher(value);
        if (newVoucher) {
          onInputChange('voucher', newVoucher);
        }
      }
    }
  };

  const formatTime = (time) => {
    if (!time) return '';
    return time.substring(0, 5);
  };

  return (
    <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
      <UserSearchSection 
        searchCPF={searchCPF}
        setSearchCPF={setSearchCPF}
        onSearch={handleSearch}
      />
      
      <UserBasicInfo 
        formData={formData}
        onInputChange={onInputChange}
        handleCPFChange={handleCPFChange}
      />

      <CompanySelect 
        value={formData.empresa_id}
        onValueChange={(value) => onInputChange('empresa_id', value)}
      />

      <div className="flex items-center space-x-2">
        <Input 
          placeholder="Voucher" 
          value={showVoucher ? formData.voucher : '****'}
          readOnly
        />
        <Button type="button" onClick={() => setShowVoucher(!showVoucher)}>
          {showVoucher ? <EyeOff size={20} /> : <Eye size={20} />}
        </Button>
      </div>

      <Select 
        value={formData.selectedTurno} 
        onValueChange={(value) => onInputChange('selectedTurno', value)}
        disabled={isLoadingTurnos}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder={isLoadingTurnos ? "Carregando turnos..." : "Selecione o turno"} />
        </SelectTrigger>
        <SelectContent>
          {turnos.map((turno) => (
            <SelectItem key={turno.id} value={turno.tipo_turno}>
              {turno.tipo_turno.charAt(0).toUpperCase() + turno.tipo_turno.slice(1)} ({formatTime(turno.horario_inicio)} - {formatTime(turno.horario_fim)})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

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
          <Button type="button" onClick={onSave}>
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