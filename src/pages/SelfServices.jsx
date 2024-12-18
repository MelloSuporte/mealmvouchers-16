import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { Coffee, Utensils, Moon, Plus, Sandwich } from 'lucide-react';
import { toast } from "sonner";
import { supabase } from '../config/supabase';
import { useQuery } from '@tanstack/react-query';
import logger from '../config/logger';

const SelfServices = () => {
  const navigate = useNavigate();
  const [backgroundImage, setBackgroundImage] = useState('');

  const { data: meals, isLoading, error } = useQuery({
    queryKey: ['tipos_refeicao'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tipos_refeicao')
        .select('id, nome, ativo')
        .eq('ativo', true)
        .order('nome');
      
      if (error) throw error;
      return data;
    }
  });

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

    // Verifica se existe um voucher no localStorage
    const disposableVoucher = localStorage.getItem('disposableVoucher');
    const commonVoucher = localStorage.getItem('commonVoucher');
    
    if (!disposableVoucher && !commonVoucher) {
      toast.error('Nenhum voucher válido encontrado');
      navigate('/voucher');
    }
  }, [navigate]);

  const handleMealSelection = async (meal) => {
    try {
      const disposableVoucher = JSON.parse(localStorage.getItem('disposableVoucher') || '{}');
      const commonVoucher = JSON.parse(localStorage.getItem('commonVoucher') || '{}');
      
      logger.info('Selecionando refeição:', { mealId: meal.id, mealName: meal.nome });

      // Se for voucher descartável
      if (disposableVoucher.code) {
        navigate('/bom-apetite', { 
          state: { 
            mealType: meal.id,
            mealName: meal.nome,
            userName: 'Usuario'
          }
        });
      } 
      // Se for voucher comum ou extra
      else if (commonVoucher.code) {
        // Buscar o turno_id (que é UUID) do usuário
        const { data: userData, error: userError } = await supabase
          .from('usuarios')
          .select('turno_id')
          .eq('cpf', commonVoucher.cpf)
          .single();

        if (userError) {
          logger.error('Erro ao buscar turno do usuário:', userError);
          toast.error('Erro ao buscar dados do usuário');
          return;
        }

        navigate('/user-confirmation', { 
          state: { 
            userName: commonVoucher.userName,
            userTurno: userData.turno_id,
            mealType: meal.id,
            mealName: meal.nome,
            voucherCode: commonVoucher.code,
            cpf: commonVoucher.cpf
          }
        });
      } else {
        toast.error('Tipo de voucher inválido');
        navigate('/voucher');
      }
    } catch (error) {
      logger.error('Erro ao processar seleção de refeição:', error);
      toast.error('Erro ao processar voucher');
      navigate('/voucher');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    toast.error('Erro ao carregar refeições');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-600">Erro ao carregar refeições. Por favor, tente novamente.</p>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-start p-4 relative bg-blue-600 bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined
      }}
    >
      <div className="absolute top-0 right-0 w-full h-1/3 bg-blue-600 rounded-bl-[30%] flex items-start justify-center pt-8">
        <h2 className="text-3xl font-bold text-white">Escolha sua refeição</h2>
      </div>
      
      <div className="z-10 w-full max-w-md space-y-8 mt-32 flex flex-col items-center">
        <div className="grid grid-cols-2 gap-8 bg-white/90 p-8 rounded-lg shadow-lg backdrop-blur-sm">
          {meals && meals.map((meal) => (
            <Button
              key={meal.id}
              onClick={() => handleMealSelection(meal)}
              className="w-full h-32 bg-transparent hover:bg-gray-100 text-gray-800 font-semibold py-6 px-4 border border-gray-500 hover:border-transparent rounded-lg transition-all duration-300 flex flex-col items-center justify-center"
            >
              {meal.nome.toLowerCase().includes('almoço') && <Utensils className="h-12 w-12 mb-2" />}
              {meal.nome.toLowerCase().includes('café') && <Coffee className="h-12 w-12 mb-2" />}
              {meal.nome.toLowerCase().includes('lanche') && <Sandwich className="h-12 w-12 mb-2" />}
              {meal.nome.toLowerCase().includes('jantar') && <Moon className="h-12 w-12 mb-2" />}
              {meal.nome.toLowerCase().includes('ceia') && <Moon className="h-12 w-12 mb-2" />}
              {meal.nome.toLowerCase().includes('extra') && <Plus className="h-12 w-12 mb-2" />}
              {meal.nome}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SelfServices;