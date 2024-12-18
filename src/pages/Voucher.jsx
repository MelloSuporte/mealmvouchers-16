import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { Settings } from 'lucide-react';
import { toast } from "sonner";
import AdminLoginDialog from '../components/AdminLoginDialog';
import VoucherForm from '../components/voucher/VoucherForm';
import { supabase } from '../config/supabase';

const Voucher = () => {
  const [voucherCode, setVoucherCode] = useState('');
  const navigate = useNavigate();
  const [backgroundImage, setBackgroundImage] = useState('');
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);

  useEffect(() => {
    const fetchBackgroundImage = async () => {
      try {
        const { data, error } = await supabase
          .from('background_images')
          .select('image_url')
          .eq('page', 'voucher')
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
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      console.log('Verificando voucher:', voucherCode);
      
      // Primeiro verifica se é um voucher descartável
      const { data: descartaveis, error: descartavelError } = await supabase
        .from('vouchers_descartaveis')
        .select(`
          *,
          tipos_refeicao (
            id,
            nome,
            horario_inicio,
            horario_fim,
            minutos_tolerancia,
            ativo
          )
        `)
        .eq('codigo', voucherCode)
        .eq('usado', false)
        .single();

      if (descartaveis) {
        console.log('Voucher descartável encontrado:', descartaveis);
        
        // Validar data de expiração
        const expirationDate = new Date(descartaveis.data_expiracao);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        expirationDate.setHours(0, 0, 0, 0);

        if (expirationDate < today) {
          toast.error('Este voucher está expirado');
          return;
        }

        if (expirationDate > today) {
          const formattedDate = expirationDate.toLocaleDateString('pt-BR');
          toast.error(`Este voucher é válido apenas para ${formattedDate}`);
          return;
        }

        // Validar horário da refeição
        const now = new Date();
        const currentTime = now.getHours() * 60 + now.getMinutes(); // Converter para minutos
        const startTime = descartaveis.tipos_refeicao.horario_inicio.split(':');
        const endTime = descartaveis.tipos_refeicao.horario_fim.split(':');
        const toleranceMinutes = descartaveis.tipos_refeicao.minutos_tolerancia || 0;

        const startMinutes = parseInt(startTime[0]) * 60 + parseInt(startTime[1]);
        const endMinutes = parseInt(endTime[0]) * 60 + parseInt(endTime[1]) + toleranceMinutes;

        if (currentTime < startMinutes || currentTime > endMinutes) {
          toast.error(`Esta refeição só pode ser utilizada entre ${descartaveis.tipos_refeicao.horario_inicio} e ${descartaveis.tipos_refeicao.horario_fim}`);
          return;
        }

        localStorage.setItem('disposableVoucher', JSON.stringify({
          code: voucherCode,
          mealTypeId: descartaveis.tipo_refeicao_id,
          mealType: descartaveis.tipos_refeicao.nome
        }));

        navigate('/self-services');
        return;
      }

      // Se não for voucher descartável, verifica se é um voucher comum
      const { data: users, error: userError } = await supabase
        .from('usuarios')
        .select(`
          *,
          empresas (
            id,
            nome
          ),
          turnos (
            id,
            tipo_turno
          )
        `)
        .eq('voucher', voucherCode)
        .eq('suspenso', false)
        .maybeSingle();

      if (users) {
        console.log('Voucher comum encontrado:', users);
        localStorage.setItem('commonVoucher', JSON.stringify({
          code: voucherCode,
          userName: users.nome,
          turno: users.turnos?.tipo_turno,
          cpf: users.cpf
        }));
        navigate('/self-services');
        return;
      }

      // Se não for nem comum nem descartável, verifica se é um voucher extra
      const { data: extraVouchers, error: extraError } = await supabase
        .from('vouchers_extras')
        .select('*')
        .eq('codigo', voucherCode)
        .eq('usado', false)
        .maybeSingle();

      if (extraVouchers) {
        console.log('Voucher extra encontrado:', extraVouchers);
        localStorage.setItem('extraVoucher', JSON.stringify({
          code: voucherCode,
          cpf: extraVouchers.usuario_id
        }));
        navigate('/self-services');
        return;
      }

      console.log('Nenhum voucher válido encontrado');
      toast.error("Voucher inválido ou já utilizado");
      
    } catch (error) {
      console.error('Erro ao validar voucher:', error);
      toast.error(error.message || "Erro ao validar o voucher");
    }
  };

  return (
    <div 
      className="min-h-screen bg-blue-600 flex flex-col items-center justify-center p-4 relative bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined
      }}
    >
      <Button
        onClick={() => setIsAdminLoginOpen(true)}
        className="absolute top-4 right-4 bg-white text-blue-600 hover:bg-blue-100"
      >
        <Settings className="mr-2 h-4 w-4" />
        Admin
      </Button>
      <div className="w-full max-w-md space-y-8 bg-white p-6 rounded-lg shadow-lg">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-blue-600">Voucher</h2>
        </div>
        <VoucherForm
          voucherCode={voucherCode}
          onSubmit={handleSubmit}
          onNumpadClick={(num) => setVoucherCode(prev => prev.length < 4 ? prev + num : prev)}
          onBackspace={() => setVoucherCode(prev => prev.slice(0, -1))}
        />
      </div>
      <AdminLoginDialog 
        isOpen={isAdminLoginOpen} 
        onClose={() => setIsAdminLoginOpen(false)} 
      />
    </div>
  );
};

export default Voucher;