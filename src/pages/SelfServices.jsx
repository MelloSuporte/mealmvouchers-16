import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../config/supabase';
import { toast } from "sonner";

const SelfServices = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [backgroundImage, setBackgroundImage] = useState('');

  // Extrair vouchers do localStorage
  const disposableVoucher = JSON.parse(localStorage.getItem('disposableVoucher') || '{}');
  const commonVoucher = JSON.parse(localStorage.getItem('commonVoucher') || '{}');
  const extraVoucher = JSON.parse(localStorage.getItem('extraVoucher') || '{}');

  useEffect(() => {
    const fetchBackgroundImage = async () => {
      try {
        const { data, error } = await supabase
          .from('background_images')
          .select('image_url')
          .eq('page', 'selfServices')
          .eq('is_active', true)
          .single();

        if (error) {
          console.error('Erro ao buscar imagem de fundo:', error);
          return;
        }
        
        if (data?.image_url) {
          setBackgroundImage(data.image_url);
        }
      } catch (error) {
        console.error('Erro ao buscar imagem de fundo:', error);
      }
    };

    fetchBackgroundImage();
  }, []);

  useEffect(() => {
    const fetchMeals = async () => {
      try {
        const { data, error } = await supabase
          .from('tipos_refeicao')
          .select('*')
          .order('created_at', { ascending: true });

        if (error) throw error;

        setMeals(data || []);
      } catch (error) {
        console.error('Erro ao buscar refeições:', error);
        toast.error('Erro ao carregar refeições');
      } finally {
        setLoading(false);
      }
    };

    fetchMeals();
  }, []);

  const handleMealSelection = (meal) => {
    // Se não houver voucher, redirecionar para a página de voucher
    if (!disposableVoucher.code && !commonVoucher.code && !extraVoucher.code) {
      toast.error('Nenhum voucher válido encontrado');
      navigate('/voucher');
      return;
    }

    try {
      // Se for voucher descartável
      if (disposableVoucher.code) {
        navigate('/bom-apetite', { 
          state: { 
            mealType: meal.id,
            mealName: meal.nome,
            userName: 'Visitante'
          }
        });
      }
      // Se for voucher comum ou extra
      else if (commonVoucher.code || extraVoucher.code) {
        navigate('/user-confirmation', {
          state: {
            mealType: meal.id,
            mealName: meal.nome,
            voucherType: commonVoucher.code ? 'common' : 'extra'
          }
        });
      }
    } catch (error) {
      console.error('Erro ao processar seleção de refeição:', error);
      toast.error('Erro ao processar seleção');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen bg-cover bg-center bg-no-repeat p-4"
      style={{
        backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'linear-gradient(to bottom, #9b87f5, #7E69AB)',
        backgroundColor: '#9b87f5'
      }}
    >
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white text-center mb-8">
          Selecione o Tipo de Refeição
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {meals.map((meal) => (
            <button
              key={meal.id}
              onClick={() => handleMealSelection(meal)}
              className="bg-white/90 backdrop-blur-sm p-6 rounded-lg shadow-lg hover:bg-white/95 transition-all duration-300 flex flex-col items-center justify-center min-h-[200px]"
            >
              <h2 className="text-xl font-semibold text-gray-800 mb-2">{meal.nome}</h2>
              {meal.descricao && (
                <p className="text-gray-600 text-center">{meal.descricao}</p>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SelfServices;