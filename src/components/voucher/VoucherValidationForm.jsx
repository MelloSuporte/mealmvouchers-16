
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from "sonner";
import VoucherForm from './VoucherForm';
import { useMealTypes } from '../../hooks/useMealTypes';
import logger from '../../config/logger';
import { supabase } from '../../config/supabase';

const VoucherValidationForm = () => {
  const navigate = useNavigate();
  const [isValidating, setIsValidating] = useState(false);
  const { data: mealTypes, isLoading: isLoadingMealTypes } = useMealTypes();

  const getCurrentMealType = (mealTypes) => {
    if (!mealTypes?.length) {
      logger.warn('Nenhum tipo de refeição disponível');
      return null;
    }

    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTimeInMinutes = currentHour * 60 + currentMinute;

    logger.info('Buscando tipo de refeição para horário:', { 
      hora: currentHour, 
      minuto: currentMinute,
      timeInMinutes: currentTimeInMinutes,
      tiposDisponiveis: mealTypes.map(t => ({
        nome: t.nome,
        inicio: t.horario_inicio,
        fim: t.horario_fim,
        tolerancia: t.minutos_tolerancia
      }))
    });

    const availableMealType = mealTypes.find(type => {
      const [startHour, startMinute] = type.horario_inicio.split(':').map(Number);
      const [endHour, endMinute] = type.horario_fim.split(':').map(Number);
      const toleranceMinutes = type.minutos_tolerancia || 0;

      const startTimeInMinutes = startHour * 60 + startMinute;
      let endTimeInMinutes = endHour * 60 + endMinute + toleranceMinutes;

      logger.info('Verificando tipo de refeição:', {
        nome: type.nome,
        startTimeInMinutes,
        endTimeInMinutes,
        currentTimeInMinutes,
        toleranceMinutes
      });

      // Handle times that cross midnight
      if (endTimeInMinutes < startTimeInMinutes) {
        return currentTimeInMinutes >= startTimeInMinutes || 
               currentTimeInMinutes <= endTimeInMinutes;
      }

      const isWithinTime = currentTimeInMinutes >= startTimeInMinutes && 
                          currentTimeInMinutes <= endTimeInMinutes;

      if (isWithinTime) {
        logger.info('Tipo de refeição encontrado:', {
          nome: type.nome,
          inicio: type.horario_inicio,
          fim: type.horario_fim,
          tolerancia: type.minutos_tolerancia
        });
      }

      return isWithinTime;
    });

    if (!availableMealType) {
      logger.warn('Nenhum tipo de refeição disponível para o horário atual');
    }

    return availableMealType;
  };

  const validateVoucherOnly = async (code, tipoRefeicaoId) => {
    try {
      logger.info('Validando regras do voucher (sem registrar uso):', { codigo: code, tipoRefeicaoId });
      
      // Primeiro tenta encontrar como voucher comum
      const { data: user, error: userError } = await supabase
        .from('usuarios')
        .select(`
          *,
          empresas (
            id,
            nome,
            ativo
          ),
          turnos (
            id,
            tipo_turno,
            horario_inicio,
            horario_fim,
            ativo
          )
        `)
        .eq('voucher', code)
        .maybeSingle();

      if (userError) {
        logger.error('Erro ao buscar usuário:', userError);
        throw userError;
      }

      // Se encontrado como voucher comum
      if (user) {
        logger.info('Voucher comum encontrado:', user);

        if (user.suspenso) {
          return { success: false, error: 'Usuário suspenso' };
        }

        if (!user.empresas?.ativo) {
          return { success: false, error: 'Empresa inativa' };
        }

        if (!user.turnos?.ativo) {
          return { success: false, error: 'Turno inativo' };
        }

        // Verificar horário do turno
        const now = new Date();
        const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:00`;

        if (currentTime < user.turnos.horario_inicio || currentTime > user.turnos.horario_fim) {
          return { 
            success: false, 
            error: `Fora do horário do turno (${user.turnos.horario_inicio} - ${user.turnos.horario_fim})` 
          };
        }

        // Verificar se já usou este tipo de refeição hoje
        const today = new Date().toISOString().split('T')[0];
        const { data: usageToday } = await supabase
          .from('uso_voucher')
          .select('*')
          .eq('usuario_id', user.id)
          .eq('tipo_refeicao_id', tipoRefeicaoId)
          .gte('usado_em', today);

        if (usageToday && usageToday.length > 0) {
          return { success: false, error: 'Tipo de refeição já utilizado hoje' };
        }

        // Verificar limite diário total
        const { data: totalUsageToday } = await supabase
          .from('uso_voucher')
          .select('*')
          .eq('usuario_id', user.id)
          .gte('usado_em', today);

        if (totalUsageToday && totalUsageToday.length >= 3) {
          return { success: false, error: 'Limite diário de refeições atingido' };
        }

        // Verificar intervalo mínimo entre refeições
        if (totalUsageToday && totalUsageToday.length > 0) {
          const lastUsage = new Date(totalUsageToday[totalUsageToday.length - 1].usado_em);
          const minInterval = new Date(lastUsage.getTime() + (3 * 60 * 60 * 1000)); // 3 horas

          if (now < minInterval) {
            return { success: false, error: 'Intervalo mínimo entre refeições não respeitado' };
          }
        }

        return {
          success: true,
          voucherType: 'comum',
          user: user,
          code: code
        };
      }

      // Se não encontrado como voucher comum, tentar descartável
      const { data: disposableVoucher, error: disposableError } = await supabase
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
        .eq('codigo', code)
        .is('usado_em', null)
        .maybeSingle();

      if (disposableError) {
        logger.error('Erro ao buscar voucher descartável:', disposableError);
        throw disposableError;
      }

      if (disposableVoucher) {
        logger.info('Voucher descartável encontrado:', disposableVoucher);

        // Validar data de expiração
        const today = new Date();
        const expirationDate = new Date(disposableVoucher.data_expiracao);
        
        if (today > expirationDate) {
          return { success: false, error: 'Voucher expirado' };
        }

        // Validar tipo de refeição
        if (disposableVoucher.tipo_refeicao_id !== tipoRefeicaoId) {
          return { success: false, error: 'Tipo de refeição inválido para este voucher' };
        }

        return {
          success: true,
          voucherType: 'descartavel',
          data: disposableVoucher,
          code: code
        };
      }

      return {
        success: false,
        error: 'Voucher não encontrado ou inválido'
      };

    } catch (error) {
      logger.error('Erro na validação:', error);
      return { 
        success: false, 
        error: error.message || 'Erro ao validar voucher'
      };
    }
  };

  const handleSubmit = async (voucherCode) => {
    if (isValidating) return;
    
    try {
      setIsValidating(true);
      logger.info('Iniciando validação do voucher:', voucherCode);

      if (isLoadingMealTypes || !mealTypes) {
        toast.error('Carregando tipos de refeição...');
        return;
      }

      const currentMealType = getCurrentMealType(mealTypes);
      
      if (!currentMealType) {
        toast.error('Fora do horário de refeições');
        return;
      }

      logger.info('Validando voucher com tipo de refeição:', {
        id: currentMealType.id,
        nome: currentMealType.nome
      });

      // Apenas validar, sem registrar uso
      const result = await validateVoucherOnly(voucherCode, currentMealType.id);
      
      if (result.success) {
        logger.info('Voucher validado com sucesso, redirecionando para confirmação');
        localStorage.setItem('currentMealType', JSON.stringify(currentMealType));
        
        if (result.voucherType === 'descartavel') {
          localStorage.setItem('disposableVoucher', JSON.stringify({
            voucher: result.code,
            mealTypeId: currentMealType.id
          }));
        } else {
          localStorage.setItem('commonVoucher', JSON.stringify({
            voucher: result.code,
            userName: result.user?.nome || 'Usuário',
            turno: result.user?.turnos?.tipo_turno,
            cpf: result.user?.cpf,
            userId: result.user?.id,
            mealTypeId: currentMealType.id
          }));
        }
        
        toast.success('Voucher validado com sucesso! Confirme para registrar o uso.');
        navigate('/user-confirmation');
      } else {
        toast.error(result.error || 'Erro ao validar voucher');
      }
    } catch (error) {
      logger.error('Erro ao validar voucher:', error);
      toast.error(error.message || "Erro ao validar o voucher");
    } finally {
      setIsValidating(false);
    }
  };

  if (isLoadingMealTypes) {
    return <div>Carregando tipos de refeição...</div>;
  }

  return (
    <VoucherForm
      onSubmit={handleSubmit}
      isSubmitting={isValidating}
    />
  );
};

export default VoucherValidationForm;
