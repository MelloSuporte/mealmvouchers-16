import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { Settings } from 'lucide-react';
import { toast } from "sonner";
import AdminLoginDialog from '../components/AdminLoginDialog';
import VoucherForm from '../components/voucher/VoucherForm';
import { supabase } from '../config/supabase';
import { validateDisposableVoucherRules } from '../utils/voucherValidations';

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
            hora_inicio,
            hora_fim,
            minutos_tolerancia,
            ativo
          )
        `)
        .eq('codigo', voucherCode)
        .eq('usado', false)
        .single();

      if (descartavelError) {
        console.log('Erro ou voucher não encontrado:', descartavelError);
        throw new Error('Voucher inválido ou já utilizado');
      }

      if (descartaveis) {
        console.log('Voucher descartável encontrado:', descartaveis);
        
        // Validar regras do voucher
        await validateDisposableVoucherRules(descartaveis, supabase);

        // Se passou pelas validações, salva no localStorage e navega
        localStorage.setItem('disposableVoucher', JSON.stringify({
          code: voucherCode,
          mealTypeId: descartaveis.tipo_refeicao_id,
          mealType: descartaveis.tipos_refeicao.nome
        }));

        navigate('/self-services');
        return;
      }

      // Se não for descartável, verifica se é um voucher comum
      const { data: users, error: userError } = await supabase
        .from('usuarios')
        .select('*')
        .eq('voucher', voucherCode)
        .eq('suspenso', false);

      if (userError) throw userError;

      if (users && users.length > 0) {
        const user = users[0];
        localStorage.setItem('commonVoucher', JSON.stringify({
          code: voucherCode,
          userName: user.nome,
          turno: user.turno_id,
          cpf: user.cpf
        }));
        navigate('/self-services');
      } else {
        // Verifica se é um voucher extra
        const { data: extraVouchers, error: extraError } = await supabase
          .from('vouchers_extras')
          .select('*')
          .eq('codigo', voucherCode)
          .eq('usado', false);

        if (extraError) throw extraError;

        if (extraVouchers && extraVouchers.length > 0) {
          const extraVoucher = extraVouchers[0];
          localStorage.setItem('extraVoucher', JSON.stringify({
            code: voucherCode,
            cpf: extraVoucher.cpf
          }));
          navigate('/self-services');
        } else {
          toast.error("Voucher inválido ou já utilizado");
        }
      }
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