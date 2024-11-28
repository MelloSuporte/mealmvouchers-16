import React, { useState } from 'react';
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import api from '../../utils/api';
import CompanyUserSelector from './rls/CompanyUserSelector';
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ptBR } from 'date-fns/locale';
import { formatCPF } from '../../utils/formatters';

const RLSForm = () => {
  const [selectedCompany, setSelectedCompany] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedDates, setSelectedDates] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [observacao, setObservacao] = useState("");

  const { data: users = [], isLoading: isLoadingUsers } = useQuery({
    queryKey: ['users', searchTerm, selectedCompany],
    queryFn: async () => {
      if (!searchTerm || searchTerm.length < 3) return [];
      try {
        const cleanCPF = searchTerm.replace(/\D/g, '');
        const response = await api.get(`/usuarios/search?term=${cleanCPF}${selectedCompany !== "all" ? `&company_id=${selectedCompany}` : ''}`);
        
        if (!response.data) {
          toast.error("Nenhum usuário encontrado");
          return [];
        }

        if (Array.isArray(response.data)) {
          return response.data.map(user => ({
            id: user.id,
            nome: user.nome,
            cpf: formatCPF(user.cpf)
          }));
        }
        return [];
      } catch (error) {
        console.error('Erro ao buscar usuários:', error);
        toast.error("Erro ao buscar usuários: " + (error.response?.data?.message || error.message));
        return [];
      }
    },
    enabled: searchTerm.length >= 3
  });

  const handleSearchTermChange = (e) => {
    const formattedCPF = formatCPF(e);
    setSearchTerm(formattedCPF);
    if (selectedUser) {
      setSelectedUser("");
    }
  };

  const validateDates = (dates) => {
    if (!dates || !Array.isArray(dates) || dates.length === 0) return false;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return !dates.some(date => date < today);
  };

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

    if (!validateDates(selectedDates)) {
      toast.error("Não é possível gerar vouchers para datas passadas");
      return;
    }

    setIsSubmitting(true);
    try {
      const formattedDates = selectedDates.map(date => date.toISOString().split('T')[0]);
      
      const response = await api.post('/api/vouchers-extra', {
        usuario_id: selectedUser,
        datas: formattedDates,
        observacao: observacao.trim() || 'Voucher extra gerado via sistema'
      });

      if (response.data && response.data.success) {
        toast.success(response.data.message || `${formattedDates.length} voucher(s) extra(s) gerado(s) com sucesso!`);
        
        // Limpa o formulário após sucesso
        setSelectedUser("");
        setSelectedDates([]);
        setSearchTerm("");
        setObservacao("");
      } else {
        throw new Error(response.data?.error || 'Erro ao gerar vouchers extras');
      }
    } catch (error) {
      console.error('Erro ao gerar vouchers extras:', error);
      toast.error("Erro ao gerar vouchers extras: " + (error.response?.data?.error || error.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <CompanyUserSelector
        selectedCompany={selectedCompany}
        setSelectedCompany={setSelectedCompany}
        searchTerm={searchTerm}
        setSearchTerm={handleSearchTermChange}
        selectedUser={selectedUser}
        setSelectedUser={setSelectedUser}
        users={users}
        isLoadingUsers={isLoadingUsers}
      />

      <div className="space-y-2">
        <Label htmlFor="observacao">Observação</Label>
        <Input
          id="observacao"
          value={observacao}
          onChange={(e) => setObservacao(e.target.value)}
          placeholder="Digite uma observação para o voucher extra"
          maxLength={255}
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium">Datas para Voucher Extra</label>
        <Calendar
          mode="multiple"
          selected={selectedDates}
          onSelect={setSelectedDates}
          className="rounded-md border"
          locale={ptBR}
          disabled={(date) => {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            return date < today;
          }}
        />
        <p className="text-sm text-gray-500">
          {selectedDates.length > 0 && `${selectedDates.length} data(s) selecionada(s)`}
        </p>
      </div>

      <Button 
        type="submit" 
        disabled={isSubmitting || !selectedUser || selectedDates.length === 0}
        className="w-full"
      >
        {isSubmitting ? 'Gerando...' : 'Gerar Vouchers Extras'}
      </Button>
    </form>
  );
};

export default RLSForm;