import React, { useState } from 'react';
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import api from '../../utils/api';
import CompanyUserSelector from './rls/CompanyUserSelector';
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ptBR } from 'date-fns/locale';
import { formatCPF } from '../../utils/formatters';
import { useVoucherFormLogic } from './vouchers/VoucherFormLogic';
import { CalendarDays } from 'lucide-react';

const RLSForm = () => {
  const [selectedCompany, setSelectedCompany] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedDates, setSelectedDates] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [observacao, setObservacao] = useState("");

  const resetForm = () => {
    setSelectedUser("");
    setSelectedDates([]);
    setSearchTerm("");
    setObservacao("");
  };

  const { handleVoucherSubmission } = useVoucherFormLogic(
    selectedUser,
    selectedDates,
    observacao,
    resetForm
  );

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
    await handleVoucherSubmission();
    setIsSubmitting(false);
  };

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

  return (
    <Card className="w-full max-w-3xl mx-auto shadow-sm">
      <CardHeader className="space-y-1 pb-4">
        <CardTitle className="text-lg font-medium">Vouchers Extras</CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          Gere vouchers extras para usuários específicos
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
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

          <div className="space-y-1.5">
            <Label htmlFor="observacao" className="text-sm">Observação</Label>
            <Input
              id="observacao"
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
              placeholder="Observação opcional para o voucher extra"
              maxLength={255}
              className="h-9 text-sm"
            />
            <p className="text-xs text-muted-foreground">
              A observação será registrada junto ao voucher
            </p>
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm flex items-center gap-2">
              <CalendarDays className="h-4 w-4" />
              Datas para Voucher Extra
            </Label>
            <Calendar
              mode="multiple"
              selected={selectedDates}
              onSelect={setSelectedDates}
              className="rounded-md border p-3"
              locale={ptBR}
              disabled={(date) => {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                return date < today;
              }}
              classNames={{
                day_selected: "bg-primary text-primary-foreground hover:bg-primary/90",
                day_today: "bg-accent text-accent-foreground",
                day: "h-8 w-8 text-sm p-0 font-normal aria-selected:opacity-100"
              }}
            />
            <p className="text-xs text-muted-foreground">
              {selectedDates.length === 0 
                ? "Selecione as datas desejadas" 
                : `${selectedDates.length} data(s) selecionada(s)`
              }
            </p>
          </div>

          <Button 
            type="submit" 
            disabled={isSubmitting || !selectedUser || selectedDates.length === 0}
            className="w-full h-9 text-sm"
          >
            {isSubmitting ? 'Gerando...' : 'Gerar Vouchers Extras'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default RLSForm;