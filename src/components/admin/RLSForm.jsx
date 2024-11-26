import React, { useState } from 'react';
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import api from '../../utils/api';
import CompanyUserSelector from './rls/CompanyUserSelector';
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { ptBR } from 'date-fns/locale';
import { formatCPF } from '../../utils/formatters';

const RLSForm = () => {
  const [selectedCompany, setSelectedCompany] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedDates, setSelectedDates] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: companiesData = [], isLoading: isLoadingCompanies, error: companiesError } = useQuery({
    queryKey: ['companies'],
    queryFn: async () => {
      try {
        const response = await api.get('/empresas');
        return Array.isArray(response.data) ? response.data : [];
      } catch (error) {
        toast.error("Erro ao carregar empresas: " + (error.response?.data?.message || error.message));
        return [];
      }
    }
  });

  const { data: users = [], isLoading: isLoadingUsers, error: usersError } = useQuery({
    queryKey: ['users', searchTerm, selectedCompany],
    queryFn: async () => {
      if (!searchTerm || searchTerm.length < 3) return [];
      try {
        // Formata o CPF antes de enviar para a API
        const formattedSearchTerm = searchTerm.includes('.') || searchTerm.includes('-') 
          ? searchTerm 
          : formatCPF(searchTerm);
        
        const response = await api.get(`/users/search?term=${formattedSearchTerm}${selectedCompany !== "all" ? `&company_id=${selectedCompany}` : ''}`);
        return Array.isArray(response.data) ? response.data : [];
      } catch (error) {
        toast.error("Erro ao buscar usuários: " + (error.response?.data?.message || error.message));
        return [];
      }
    },
    enabled: searchTerm.length >= 3
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedUser) {
      toast.error("Por favor, selecione um usuário");
      return;
    }

    if (!selectedDates.length) {
      toast.error("Por favor, selecione pelo menos uma data");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await api.post('/vouchers-extra', {
        user_id: selectedUser,
        dates: selectedDates
      });

      toast.success("Vouchers extras gerados com sucesso!");
      setSelectedUser("");
      setSelectedDates([]);
      setSearchTerm("");
    } catch (error) {
      toast.error("Erro ao gerar vouchers: " + (error.response?.data?.message || error.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (companiesError) {
    return <div>Erro ao carregar empresas: {companiesError.message}</div>;
  }

  if (usersError) {
    return <div>Erro ao carregar usuários: {usersError.message}</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <CompanyUserSelector
        selectedCompany={selectedCompany}
        setSelectedCompany={setSelectedCompany}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedUser={selectedUser}
        setSelectedUser={setSelectedUser}
        companies={companiesData}
        users={users}
        isLoadingCompanies={isLoadingCompanies}
        isLoadingUsers={isLoadingUsers}
      />

      <div className="space-y-2">
        <label className="block text-sm font-medium">Datas para Voucher Extra</label>
        <Calendar
          mode="multiple"
          selected={selectedDates}
          onSelect={setSelectedDates}
          className="rounded-md border"
          locale={ptBR}
        />
        <p className="text-sm text-gray-500">
          {selectedDates.length > 0 && `${selectedDates.length} data(s) selecionada(s)`}
        </p>
      </div>

      <Button 
        type="submit" 
        disabled={isSubmitting || !selectedUser || selectedDates.length === 0}
      >
        {isSubmitting ? 'Gerando...' : 'Gerar Vouchers Extras'}
      </Button>
    </form>
  );
};

export default RLSForm;