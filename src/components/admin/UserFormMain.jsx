import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Upload, Search } from 'lucide-react';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import api from '../../utils/api';

const UserFormMain = ({
  formData,
  onInputChange,
  onSave
}) => {
  const [showVoucher, setShowVoucher] = React.useState(false);
  const [searchCPF, setSearchCPF] = React.useState('');

  const { data: companiesData, isLoading: isLoadingCompanies } = useQuery({
    queryKey: ['companies'],
    queryFn: async () => {
      const response = await api.get('/companies');
      return response.data || [];
    }
  });

  // Fixed the API endpoint by removing the extra /api prefix
  const { data: turnosData, isLoading: isLoadingTurnos } = useQuery({
    queryKey: ['shift-configurations'],
    queryFn: async () => {
      const response = await api.get('/shift-configurations');
      return response.data || [];
    }
  });

  const companies = Array.isArray(companiesData) ? companiesData : [];
  const turnos = Array.isArray(turnosData) ? turnosData.filter(turno => turno.is_active) : [];

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
      const response = await api.get(`/users/search?cpf=${searchCPF}`);
      if (response.data) {
        const userData = response.data;
        onInputChange('userName', userData.name);
        onInputChange('userEmail', userData.email);
        onInputChange('userCPF', userData.cpf);
        onInputChange('company', userData.company_id?.toString());
        onInputChange('voucher', userData.voucher);
        onInputChange('selectedTurno', userData.turno);
        onInputChange('isSuspended', userData.is_suspended);
        onInputChange('userPhoto', userData.photo);
        toast.success('Usuário encontrado!');
      }
    } catch (error) {
      toast.error('Usuário não encontrado ou erro na busca');
    }
  };

  const generateUniqueVoucher = async (cpf) => {
    const maxAttempts = 10;
    let attempts = 0;

    const cpfNumbers = cpf.replace(/\D/g, '');
    const digitRange = cpfNumbers.substring(1, 13);
    
    while (attempts < maxAttempts) {
      let voucher = '';
      for (let i = 0; i < 4; i++) {
        const randomIndex = Math.floor(Math.random() * digitRange.length);
        voucher += digitRange[randomIndex];
      }

      try {
        const response = await api.post('/vouchers/check', { code: voucher });
        if (!response.data.exists) {
          return voucher;
        }
      } catch (error) {
        if (error.response?.status === 404) {
          return voucher;
        }
      }
      attempts++;
    }
    
    toast.error('Não foi possível gerar um voucher único após várias tentativas');
    return null;
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
      <div className="flex gap-2">
        <Input 
          placeholder="Pesquisar por CPF" 
          value={searchCPF}
          onChange={(e) => setSearchCPF(e.target.value)}
        />
        <Button type="button" onClick={handleSearch}>
          <Search size={20} className="mr-2" />
          Buscar
        </Button>
      </div>
      
      <Input 
        placeholder="Nome do usuário" 
        value={formData.userName}
        onChange={(e) => onInputChange('userName', e.target.value)}
      />
      <Input 
        placeholder="E-mail do usuário" 
        type="email"
        value={formData.userEmail}
        onChange={(e) => onInputChange('userEmail', e.target.value)}
      />
      <Input 
        placeholder="CPF (000.000.000-00)" 
        value={formData.userCPF}
        onChange={handleCPFChange}
      />
      <Select 
        value={formData.company} 
        onValueChange={(value) => onInputChange('company', value)}
        disabled={isLoadingCompanies}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder={isLoadingCompanies ? "Carregando empresas..." : "Selecione a empresa"} />
        </SelectTrigger>
        <SelectContent>
          {companiesData?.map((company) => (
            <SelectItem key={company.id} value={company.id.toString()}>
              {company.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
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
          {turnosData?.map((turno) => (
            <SelectItem key={turno.id} value={turno.shift_type}>
              {turno.shift_type.charAt(0).toUpperCase() + turno.shift_type.slice(1)} Turno ({formatTime(turno.start_time)} - {formatTime(turno.end_time)})
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
