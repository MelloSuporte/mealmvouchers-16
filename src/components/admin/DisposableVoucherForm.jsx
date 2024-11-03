import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { toast } from "sonner";
import { ptBR } from "date-fns/locale";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import api from '../../utils/api';

const DisposableVoucherForm = () => {
  const [quantity, setQuantity] = useState(1);
  const [selectedMealTypes, setSelectedMealTypes] = useState([]);
  const [selectedDates, setSelectedDates] = useState([]);
  const [mealTypes, setMealTypes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [generatedVouchers, setGeneratedVouchers] = useState([]);
  const [allVouchers, setAllVouchers] = useState([]);

  useEffect(() => {
    loadMealTypes();
    loadAllVouchers();
  }, []);

  const loadMealTypes = async () => {
    try {
      const response = await api.get('/api/meals');
      if (Array.isArray(response.data)) {
        setMealTypes(response.data.filter(meal => meal.is_active));
      } else {
        toast.error("Formato inválido de dados recebidos");
        setMealTypes([]);
      }
    } catch (error) {
      toast.error("Erro ao carregar tipos de refeição: " + error.message);
      setMealTypes([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadAllVouchers = async () => {
    try {
      const response = await api.get('/api/vouchers/disposable');
      setAllVouchers(response.data || []);
    } catch (error) {
      console.error('Error loading vouchers:', error);
    }
  };

  const handleMealTypeToggle = (typeId) => {
    setSelectedMealTypes(current => {
      if (current.includes(typeId)) {
        return current.filter(id => id !== typeId);
      } else {
        return [...current, typeId];
      }
    });
  };

  const generateUniqueVoucherCode = async () => {
    try {
      const code = Math.floor(1000 + Math.random() * 9000).toString();
      const result = await api.post('/api/vouchers/check', { code });
      if (!result.data.exists) {
        return code;
      }
      return generateUniqueVoucherCode(); // Try again if code exists
    } catch (error) {
      console.error('Error checking voucher code:', error);
      throw new Error('Erro ao verificar código do voucher');
    }
  };

  const handleGenerateVouchers = async () => {
    try {
      if (selectedDates.length === 0) {
        toast.error("Selecione pelo menos uma data");
        return;
      }

      if (selectedMealTypes.length === 0) {
        toast.error("Selecione pelo menos um tipo de refeição");
        return;
      }

      const totalVouchers = quantity * selectedDates.length * selectedMealTypes.length;
      const newVouchers = [];

      for (let i = 0; i < totalVouchers; i++) {
        const code = await generateUniqueVoucherCode();
        const response = await api.post('/api/vouchers/create', {
          code,
          meal_type_id: selectedMealTypes[0],
          created_by: 1 // Assuming created_by = 1 for now
        });

        if (response.data.success) {
          newVouchers.push(response.data.voucher);
        }
      }

      setGeneratedVouchers(newVouchers);
      setAllVouchers(prev => [...newVouchers, ...prev]);
      toast.success(`${totalVouchers} voucher(s) descartável(is) gerado(s) com sucesso!`);
      
      setQuantity(1);
      setSelectedMealTypes([]);
      setSelectedDates([]);
    } catch (error) {
      toast.error("Erro ao gerar vouchers: " + error.message);
    }
  };

  if (isLoading) {
    return <div>Carregando tipos de refeição...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Quantidade de Vouchers por Data/Refeição</label>
        <Input
          type="number"
          min="1"
          value={quantity}
          onChange={(e) => setQuantity(parseInt(e.target.value))}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Tipos de Refeição</label>
        <ScrollArea className="h-[200px] w-full rounded-md border p-4">
          <div className="space-y-2">
            {mealTypes.map((type) => (
              <div key={type.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`meal-type-${type.id}`}
                  checked={selectedMealTypes.includes(type.id)}
                  onCheckedChange={() => handleMealTypeToggle(type.id)}
                />
                <Label htmlFor={`meal-type-${type.id}`}>{type.name}</Label>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Datas de Expiração</label>
        <Calendar
          mode="multiple"
          selected={selectedDates}
          onSelect={setSelectedDates}
          className="rounded-md border"
          locale={ptBR}
          formatters={{
            formatCaption: (date) => {
              const month = ptBR.localize.month(date.getMonth());
              return `${month.charAt(0).toUpperCase() + month.slice(1)} ${date.getFullYear()}`;
            }
          }}
        />
        <p className="text-sm text-gray-500">
          {selectedDates.length > 0 && `${selectedDates.length} data(s) selecionada(s)`}
        </p>
      </div>

      <div className="flex justify-center">
        <Button 
          onClick={handleGenerateVouchers}
          disabled={selectedMealTypes.length === 0 || quantity < 1 || selectedDates.length === 0}
          className="px-6"
        >
          Gerar Vouchers Descartáveis
        </Button>
      </div>

      {/* Tabela de Vouchers Gerados */}
      <Card>
        <CardContent className="pt-6">
          <Label className="text-lg font-bold">Vouchers Descartáveis</Label>
          <div className="mt-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Tipo de Refeição</TableHead>
                  <TableHead>Data de Expiração</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allVouchers.map((voucher, index) => (
                  <TableRow key={index}>
                    <TableCell>{voucher.code}</TableCell>
                    <TableCell>{voucher.meal_type_name}</TableCell>
                    <TableCell>
                      {new Date(voucher.expired_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {voucher.is_used ? 'Utilizado' : 'Disponível'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DisposableVoucherForm;