import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from "sonner";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, AlertCircle } from "lucide-react";
import api from '../utils/api';

const UserConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [userName, setUserName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!location.state?.userName || !location.state?.mealType) {
      toast.error('Informações incompletas');
      navigate('/voucher');
    } else {
      setUserName(location.state.userName);
    }
  }, [location.state, navigate]);

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      const response = await api.post('/vouchers/validate', {
        cpf: location.state.cpf,
        voucherCode: location.state.voucherCode,
        mealType: location.state.mealType
      });

      if (response.data.success) {
        // Armazena o voucher usado com timestamp
        const usedVouchers = JSON.parse(localStorage.getItem('usedCommonVouchers') || '[]');
        usedVouchers.push({
          code: location.state.voucherCode,
          userName: location.state.userName,
          usedAt: new Date().toISOString(),
          mealType: location.state.mealType
        });
        localStorage.setItem('usedCommonVouchers', JSON.stringify(usedVouchers));
        
        // Redireciona para a página BomApetite
        navigate(`/bom-apetite/${encodeURIComponent(userName)}`, {
          state: { 
            userName: userName,
            mealType: location.state.mealType 
          }
        });
      } else {
        toast.error('Erro ao validar voucher');
        navigate('/voucher');
      }
    } catch (error) {
      console.error('Erro na validação:', error);
      toast.error(error.response?.data?.error || 'Erro ao validar voucher');
      navigate('/voucher');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Confirmar Refeição</CardTitle>
          <CardDescription className="text-center">
            Por favor, confirme os dados abaixo
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="p-4 bg-secondary rounded-lg">
            <h3 className="font-semibold text-lg mb-2">Dados do Usuário</h3>
            <div className="flex items-center space-x-2">
              <Check className="h-5 w-5 text-primary" />
              <span>{userName}</span>
            </div>
          </div>

          <div className="p-4 bg-secondary rounded-lg">
            <h3 className="font-semibold text-lg mb-2">Tipo de Refeição</h3>
            <div className="flex items-center space-x-2">
              <Check className="h-5 w-5 text-primary" />
              <span>{location.state?.mealType || 'Não especificado'}</span>
            </div>
          </div>

          <div className="bg-muted/50 p-4 rounded-lg flex items-start space-x-2">
            <AlertCircle className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
            <p className="text-sm text-muted-foreground">
              Ao confirmar, seu voucher será validado e você será redirecionado para a próxima etapa.
            </p>
          </div>
        </CardContent>

        <CardFooter className="flex justify-between space-x-4">
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => navigate('/voucher')}
          >
            Cancelar
          </Button>
          <Button 
            className="w-full"
            onClick={handleConfirm}
            disabled={isLoading}
          >
            {isLoading ? 'Confirmando...' : 'Confirmar'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default UserConfirmation;