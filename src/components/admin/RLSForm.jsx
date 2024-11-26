import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { ptBR } from 'date-fns/locale';
import { toast } from "sonner";
import { useQuery } from '@tanstack/react-query';
import api from '../../utils/api';
import CompanyUserSelector from './rls/CompanyUserSelector';
import { startOfDay, isBefore, isAfter, addMonths } from 'date-fns';

const RLSForm = () => {
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedCompany, setSelectedCompany] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDates, setSelectedDates] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: companiesData = [], isLoading: isLoadingCompanies, error: companiesError } = useQuery({
    queryKey: ['companies'],
    queryFn: async () => {
      try {
        const response = await api.get('/empresas');
        return response.data || [];
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
        const response = await api.get(`/users/search?term=${searchTerm}${selectedCompany !== "all" ? `&company_id=${selectedCompany}` : ''}`);
        return response.data || [];
      } catch (error) {
        toast.error("Erro ao buscar usuários: " + (error.response?.data?.message || error.message));
        return [];
      }
    },
    enabled: searchTerm.length >= 3
  });

  const validateDates = (dates) => {
    const today = startOfDay(new Date());
    const maxDate = addMonths(today, 3);

    for (const date of dates) {
      if (isBefore(date, today)) {
        throw new Error("Não é possível liberar vouchers para datas passadas");
      }
      if (isAfter(date, maxDate)) {
        throw new Error("Vouchers extras podem ser liberados apenas para os próximos 3 meses");
      }
    }
  };

  const handleSaveRLS = async () => {
    if (!selectedUser || selectedDates.length === 0) {
      toast.error("Por favor, selecione um usuário e pelo menos uma data.");
      return;
    }

    if (isSubmitting) {
      toast.warning("Aguarde, processando solicitação anterior...");
      return;
    }
    
    try {
      setIsSubmitting(true);
      validateDates(selectedDates);

      const promises = selectedDates.map(date => 
        api.post('/extra-vouchers', {
          userId: selectedUser,
          dates: [date]
        })
      );
      
      await Promise.all(promises);
      toast.success("Vouchers extras liberados com sucesso!");
      
      setSelectedUser("");
      setSelectedDates([]);
      setSearchTerm("");
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message;
      toast.error("Erro ao liberar vouchers extras: " + errorMessage);
      
      if (error.response?.status === 503) {
        toast.error("Servidor temporariamente indisponível. Tente novamente em alguns instantes.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (companiesError || usersError) {
    toast.error("Erro ao carregar dados. Por favor, recarregue a página.");
  }

  return (
    <div className="space-y-6">
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
          disabled={(date) => isBefore(date, startOfDay(new Date()))}
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
  );
};

export default RLSForm;