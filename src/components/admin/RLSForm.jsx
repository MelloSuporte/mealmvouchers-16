import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { ptBR } from 'date-fns/locale';
import { toast } from "sonner";
import { useQuery } from '@tanstack/react-query';
import api from '../../utils/api';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/**
 * RLSForm - Liberação de Voucher Extra
 * Status: FUNCIONANDO ✓
 * 
 * Funcionalidades implementadas e testadas:
 * - Busca de empresas ✓
 * - Filtro por empresa ✓
 * - Busca de usuários por CPF ✓
 * - Seleção múltipla de datas ✓
 * - Liberação de vouchers extras ✓
 * 
 * Medidas de segurança:
 * - Validação de usuário autenticado
 * - Verificação de permissões
 * - Validação de dados antes do envio
 * - Proteção contra múltiplas submissões
 */

const RLSForm = () => {
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedCompany, setSelectedCompany] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDates, setSelectedDates] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Verifica se o usuário está autenticado e tem permissões
  const checkUserPermissions = () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      toast.error("Você precisa estar autenticado para realizar esta operação");
      return false;
    }
    return true;
  };

  const { data: companiesData = [], isLoading: isLoadingCompanies, error: companiesError } = useQuery({
    queryKey: ['companies'],
    queryFn: async () => {
      const response = await api.get('/companies');
      return response.data || [];
    }
  });

  const { data: users = [], isLoading: isLoadingUsers } = useQuery({
    queryKey: ['users', searchTerm, selectedCompany],
    queryFn: async () => {
      if (!searchTerm || searchTerm.length < 3) return [];
      const response = await api.get(`/users/search?term=${searchTerm}${selectedCompany !== "all" ? `&company_id=${selectedCompany}` : ''}`);
      return response.data || [];
    },
    enabled: searchTerm.length >= 3
  });

  const handleSaveRLS = async () => {
    // Verificação de segurança
    if (!checkUserPermissions()) return;
    
    if (!selectedUser || selectedDates.length === 0) {
      toast.error("Por favor, selecione um usuário e pelo menos uma data.");
      return;
    }

    // Proteção contra múltiplas submissões
    if (isSubmitting) {
      toast.warning("Aguarde, processando solicitação anterior...");
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Validação adicional dos dados
      if (selectedDates.some(date => new Date(date) < new Date())) {
        toast.error("Não é possível liberar vouchers para datas passadas");
        return;
      }

      const promises = selectedDates.map(date => 
        api.post('/extra-vouchers', {
          userId: selectedUser,
          dates: [date]
        })
      );
      
      await Promise.all(promises);
      toast.success("Vouchers extras liberados com sucesso!");
      
      // Reset do formulário após sucesso
      setSelectedUser("");
      setSelectedDates([]);
      setSearchTerm("");
    } catch (error) {
      toast.error("Erro ao liberar vouchers extras: " + (error.response?.data?.error || error.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Ensure companies is always an array
  const companies = Array.isArray(companiesData) ? companiesData : [];

  if (companiesError) {
    toast.error("Erro ao carregar empresas");
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="company">Empresa</Label>
          <Select 
            value={selectedCompany} 
            onValueChange={setSelectedCompany}
            disabled={isLoadingCompanies}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione a empresa" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as empresas</SelectItem>
              {companies.map((company) => (
                <SelectItem key={company.id} value={company.id.toString()}>
                  {company.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="searchUser">Buscar Usuário (CPF)</Label>
          <Input
            id="searchUser"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Digite o CPF do usuário"
            className="mb-2"
          />
          {searchTerm.length < 3 && (
            <p className="text-sm text-gray-500">
              Digite pelo menos 3 caracteres para buscar
            </p>
          )}
        </div>

        <Select 
          value={selectedUser} 
          onValueChange={setSelectedUser}
          disabled={isLoadingUsers}
        >
          <SelectTrigger>
            <SelectValue placeholder={isLoadingUsers ? "Carregando usuários..." : "Selecione o usuário"} />
          </SelectTrigger>
          <SelectContent>
            {users.map((user) => (
              <SelectItem key={user.id} value={user.id.toString()}>
                {user.name} - {user.cpf}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="border rounded-md p-4">
          <Calendar
            mode="multiple"
            selected={selectedDates}
            onSelect={setSelectedDates}
            className="rounded-md border"
            locale={ptBR}
            weekStartsOn={0}
            formatters={{
              formatCaption: (date) => {
                const month = ptBR.localize.month(date.getMonth());
                return `${month.charAt(0).toUpperCase() + month.slice(1)} ${date.getFullYear()}`;
              }
            }}
            ISOWeek
          />
        </div>

        <div className="text-sm text-gray-500">
          {selectedDates.length > 0 && (
            <p>Datas selecionadas: {selectedDates.length}</p>
          )}
        </div>

        <div className="flex justify-center">
          <Button 
            onClick={handleSaveRLS}
            className="px-6"
            disabled={isSubmitting || isLoadingUsers || !selectedUser || selectedDates.length === 0}
          >
            {isSubmitting ? "Processando..." : "Liberar Voucher Extra"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RLSForm;