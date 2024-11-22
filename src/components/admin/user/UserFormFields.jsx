import React from 'react';
import UserSearchSection from './UserSearchSection';
import UserBasicInfo from './UserBasicInfo';
import CompanySelect from './CompanySelect';
import VoucherInput from './VoucherInput';
import TurnoSelect from './TurnoSelect';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Upload } from 'lucide-react';

const UserFormFields = ({
  formData,
  onInputChange,
  onSave,
  isSubmitting,
  searchCPF,
  setSearchCPF,
  onSearch,
  isSearching,
  clearSearch,
  showVoucher,
  onToggleVoucher,
  handlePhotoUpload,
  turnos,
  isLoadingTurnos
}) => {
  return (
    <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
      <div className="space-y-2">
        <Label>Pesquisar usuário existente</Label>
        <div className="flex gap-2">
          <UserSearchSection 
            searchCPF={searchCPF}
            setSearchCPF={setSearchCPF}
            onSearch={onSearch}
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
        onToggleVoucher={onToggleVoucher}
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
        <Label htmlFor="suspend-user">Suspender acesso do usuário</Label>
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
            Enviar Foto
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
            alt="Foto do usuário" 
            className="w-10 h-10 rounded-full object-cover" 
          />
        )}
      </div>
    </form>
  );
};

export default UserFormFields;