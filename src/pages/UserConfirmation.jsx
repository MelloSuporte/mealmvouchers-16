import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from "sonner";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, AlertCircle } from "lucide-react";
import { supabase } from '../config/supabase';
import api from '../utils/api';

const UserConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [userName, setUserName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [backgroundImage, setBackgroundImage] = useState('');

  useEffect(() => {
    const fetchBackgroundImage = async () => {
      try {
        const { data, error } = await supabase
          .from('background_images')
          .select('image_url')
          .eq('page', 'userConfirmation')
          .eq('is_active', true)
          .single();

        if (error) throw error;
        if (data?.image_url) {
          setBackgroundImage(data.image_url);
        }
      } catch (error) {
        console.error('Erro ao buscar imagem de fundo:', error);
      }
    };

    fetchBackgroundImage();
    
    const commonVoucher = JSON.parse(localStorage.getItem('commonVoucher') || '{}');
    const extraVoucher = JSON.parse(localStorage.getItem('extraVoucher') || '{}');

    if (!location.state?.mealType || (!commonVoucher.code && !extraVoucher.code)) {
      toast.error('Informações incompletas');
      navigate('/voucher');
      return;
    }

    setUserName(commonVoucher.userName || 'Usuário');
  }, [location.state, navigate]);

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      const commonVoucher = JSON.parse(localStorage.getItem('commonVoucher') || '{}');
      const extraVoucher = JSON.parse(localStorage.getItem('extraVoucher') || '{}');
      
      const voucherData = {
        cpf: commonVoucher.cpf || extraVoucher.cpf,
        voucherCode: commonVoucher.code || extraVoucher.code,
        mealType: location.state.mealType
      };

      const response = await api.post('/vouchers/validate', voucherData);

      if (response.data.success) {
        navigate(`/bom-apetite/${encodeURIComponent(userName)}`, {
          state: { 
            userName: userName,
            mealType: location.state.mealType 
          }
        });
      } else {
        toast.error(response.data.error || 'Erro ao validar voucher');
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
    <div className="min-h-screen flex items-center justify-center p-4 bg-background bg-cover bg-center bg-no-repeat"
         style={{
           backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined
         }}>
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
