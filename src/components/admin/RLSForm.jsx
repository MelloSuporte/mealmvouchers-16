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
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

const RLSForm = () => {
  const [selectedUser, setSelectedUser] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDates, setSelectedDates] = useState([]);
  const [generatedVouchers, setGeneratedVouchers] = useState([]);

  const { data: users = [], isLoading: isLoadingUsers } = useQuery({
    queryKey: ['users', searchTerm],
    queryFn: async () => {
      if (!searchTerm) return [];
      const response = await api.get(`/api/users/search?term=${searchTerm}`);
      return response.data || [];
    },
    enabled: searchTerm.length >= 3
  });

  const handleSaveRLS = async () => {
    if (!selectedUser || selectedDates.length === 0) {
      toast.error("Por favor, selecione um usuário e pelo menos uma data.");
      return;
    }
    
    try {
      const response = await api.post('/api/extra-vouchers', {
        userId: selectedUser,
        dates: selectedDates
      });
      
      if (response.data.success) {
        toast.success("Vouchers extras liberados com sucesso!");
        setGeneratedVouchers(response.data.vouchers || []);
        setSelectedUser("");
        setSelectedDates([]);
      }
    } catch (error) {
      toast.error("Erro ao liberar vouchers extras: " + error.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="searchUser">Buscar Usuário</Label>
          <Input
            id="searchUser"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Digite nome, CPF ou email"
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
            disabled={isLoadingUsers || !selectedUser || selectedDates.length === 0}
          >
            Liberar Voucher Extra
          </Button>
        </div>
      </div>

      {generatedVouchers.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <Label>Vouchers Gerados</Label>
            <ScrollArea className="h-[200px] mt-2">
              <div className="space-y-2">
                {generatedVouchers.map((voucher, index) => (
                  <div key={index} className="p-2 bg-gray-100 rounded-md">
                    <p>Data: {new Date(voucher.valid_until).toLocaleDateString()}</p>
                    <p>Código: {voucher.code}</p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default RLSForm;