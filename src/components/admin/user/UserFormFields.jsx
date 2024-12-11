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
      className="space-y-4 max-w-2xl mx-auto bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700" 
      onSubmit={onSave}
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">Cadastro de Usuário</h2>
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
              className="w-8 h-8 rounded-full object-cover border-2 border-primary" 
            />
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="userName" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Nome Completo
          </Label>
          <Input
            id="userName"
            value={formData.userName}
            onChange={(e) => onInputChange('userName', e.target.value)}
            placeholder="Digite o nome completo"
            className="h-8 text-sm"
            required
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="userCPF" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            CPF
          </Label>
          <Input
            id="userCPF"
            value={formData.userCPF}
            onChange={(e) => onInputChange('userCPF', e.target.value)}
            placeholder="000.000.000-00"
            className="h-8 text-sm"
            required
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="company" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Empresa
          </Label>
          <CompanySelect
            value={formData.company}
            onValueChange={(value) => onInputChange('company', value)}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="setor" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Setor
          </Label>
          <SetorSelect
            value={formData.selectedSetor}
            onValueChange={(value) => onInputChange('selectedSetor', value)}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="turno" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Turno
          </Label>
          <TurnoSelect
            value={formData.selectedTurno}
            onValueChange={(value) => onInputChange('selectedTurno', value)}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="voucher" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Voucher
          </Label>
          <Input
            id="voucher"
            value={formData.voucher}
            onChange={(e) => onInputChange('voucher', e.target.value)}
            placeholder="Digite o voucher"
            className={cn(
              "h-8 text-sm",
              formData.voucher && "bg-gray-50 dark:bg-gray-800"
            )}
            required
          />
        </div>
      </div>

      <div className="flex items-center space-x-2 py-1.5 px-2 bg-gray-50 dark:bg-gray-800 rounded-md mt-2">
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

      <div className="flex items-center justify-end space-x-2 pt-3 border-t border-gray-100 dark:border-gray-700">
        <Button 
          type="button" 
          variant="outline"
          size="sm"
          onClick={() => document.getElementById('photo-upload').click()}
          className="h-8 text-sm"
        >
          <Upload size={14} className="mr-1.5" />
          Foto
        </Button>
        <Button 
          type="submit"
          disabled={isSubmitting}
          size="sm"
          className="h-8 text-sm"
        >
          <Save size={14} className="mr-1.5" />
          {isSubmitting ? 'Processando...' : 'Salvar'}
        </Button>
      </div>
    </form>
  );
};

export default UserFormFields;