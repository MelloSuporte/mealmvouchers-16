import React from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import CompanySelect from './CompanySelect';
import TurnoSelect from './TurnoSelect';
import SetorSelect from './SetorSelect';
import { Upload, Save } from 'lucide-react';
import { cn } from "@/lib/utils";

const UserFormFields = ({
  formData,
  onInputChange,
  onSave,
  isSubmitting,
  showVoucher,
  onToggleVoucher,
  handlePhotoUpload
}) => {
  return (
    <form 
      className="space-y-6 max-w-3xl mx-auto bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700" 
      onSubmit={onSave}
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Cadastro de Usuário</h2>
        <div className="flex items-center space-x-2">
          <input
            type="file"
            accept="image/*"
            onChange={handlePhotoUpload}
            className="hidden"
            id="photo-upload"
          />
          {formData.userPhoto && (
            <img 
              src={typeof formData.userPhoto === 'string' ? formData.userPhoto : URL.createObjectURL(formData.userPhoto)} 
              alt="Foto do usuário" 
              className="w-10 h-10 rounded-full object-cover border-2 border-primary" 
            />
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="userName" className="text-sm font-medium">
            Nome Completo
          </Label>
          <Input
            id="userName"
            value={formData.userName}
            onChange={(e) => onInputChange('userName', e.target.value)}
            placeholder="Digite o nome completo"
            className="h-9"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="userCPF" className="text-sm font-medium">
            CPF
          </Label>
          <Input
            id="userCPF"
            value={formData.userCPF}
            onChange={(e) => onInputChange('userCPF', e.target.value)}
            placeholder="000.000.000-00"
            className="h-9"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="company" className="text-sm font-medium">
            Empresa
          </Label>
          <CompanySelect
            value={formData.company}
            onValueChange={(value) => onInputChange('company', value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="setor" className="text-sm font-medium">
            Setor
          </Label>
          <SetorSelect
            value={formData.selectedSetor}
            onValueChange={(value) => onInputChange('selectedSetor', value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="turno" className="text-sm font-medium">
            Turno
          </Label>
          <TurnoSelect
            value={formData.selectedTurno}
            onValueChange={(value) => onInputChange('selectedTurno', value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="voucher" className="text-sm font-medium">
            Voucher
          </Label>
          <Input
            id="voucher"
            value={formData.voucher}
            onChange={(e) => onInputChange('voucher', e.target.value)}
            placeholder="Digite o voucher"
            className={cn(
              "h-9",
              formData.voucher && "bg-gray-50 dark:bg-gray-800"
            )}
            required
          />
        </div>
      </div>

      <div className="flex items-center space-x-2 py-2 px-2 bg-gray-50 dark:bg-gray-800 rounded-md">
        <Switch
          id="suspend-user"
          checked={formData.isSuspended}
          onCheckedChange={(checked) => onInputChange('isSuspended', checked)}
          className="data-[state=checked]:bg-red-500"
        />
        <Label 
          htmlFor="suspend-user" 
          className="text-sm text-gray-600 dark:text-gray-300 cursor-pointer"
        >
          Suspender acesso do usuário
        </Label>
      </div>

      <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-100 dark:border-gray-700">
        <Button 
          type="button" 
          variant="outline"
          size="sm"
          onClick={() => document.getElementById('photo-upload').click()}
          className="h-9"
        >
          <Upload size={16} className="mr-2" />
          Enviar Foto
        </Button>
        <Button 
          type="submit"
          disabled={isSubmitting}
          size="sm"
          className="h-9"
        >
          <Save size={16} className="mr-2" />
          {isSubmitting ? 'Processando...' : 'Salvar Usuário'}
        </Button>
      </div>
    </form>
  );
};

export default UserFormFields;