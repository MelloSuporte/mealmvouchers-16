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
      // Primeiro verifica se é um voucher descartável
      const { data: disposableVouchers, error: disposableError } = await supabase
        .from('disposable_vouchers')
        .select('*')
        .eq('code', voucherCode)
        .eq('is_used', false);

      if (disposableError) throw disposableError;

      if (disposableVouchers && disposableVouchers.length > 0) {
        const disposableVoucher = disposableVouchers[0];
        localStorage.setItem('disposableVoucher', JSON.stringify({
          code: voucherCode,
          mealTypeId: disposableVoucher.meal_type_id
        }));
        navigate('/self-services');
        return;
      }

      // Se não for descartável, verifica se é um voucher comum ou extra
      const { data: users, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('voucher', voucherCode)
        .eq('is_suspended', false);

      if (userError) throw userError;

      if (users && users.length > 0) {
        const user = users[0];
        localStorage.setItem('commonVoucher', JSON.stringify({
          code: voucherCode,
          userName: user.name,
          turno: user.shift,
          cpf: user.cpf
        }));
        navigate('/self-services');
      } else {
        // Verifica se é um voucher extra
        const { data: extraVouchers, error: extraError } = await supabase
          .from('extra_vouchers')
          .select('*')
          .eq('code', voucherCode)
          .eq('is_used', false);

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
      toast.error("Erro ao validar o voucher. Tente novamente.");
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