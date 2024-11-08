import express from 'express';
import { supabase } from '../config/supabase.js';

const router = express.Router();

router.post('/', async (req, res) => {
  const { name, startTime, endTime, value, isActive, maxUsersPerDay, toleranceMinutes } = req.body;
  
  try {
    const { data: refeicao, error } = await supabase
      .from('tipos_refeicao')
      .insert([
        {
          nome: name,
          hora_inicio: startTime,
          hora_fim: endTime,
          valor: value,
          ativo: isActive,
          max_usuarios_por_dia: maxUsersPerDay,
          minutos_tolerancia: toleranceMinutes
        }
      ])
      .select()
      .single();

    if (error) {
      throw error;
    }

    res.status(201).json(refeicao);
  } catch (error) {
    console.error('Erro ao criar tipo de refeição:', error);
    res.status(500).json({ error: 'Erro ao criar tipo de refeição' });
  }
});

router.get('/', async (req, res) => {
  try {
    const { data: refeicoes, error } = await supabase
      .from('tipos_refeicao')
      .select('*')
      .order('nome');

    if (error) {
      throw error;
    }

    // Mapeia os campos do português para inglês para manter compatibilidade com o frontend
    const refeicoesMapeadas = refeicoes.map(refeicao => ({
      id: refeicao.id,
      name: refeicao.nome,
      startTime: refeicao.hora_inicio,
      endTime: refeicao.hora_fim,
      value: refeicao.valor,
      isActive: refeicao.ativo,
      maxUsersPerDay: refeicao.max_usuarios_por_dia,
      toleranceMinutes: refeicao.minutos_tolerancia,
      createdAt: refeicao.criado_em
    }));

    res.json(refeicoesMapeadas);
  } catch (error) {
    console.error('Erro ao buscar tipos de refeição:', error);
    res.status(500).json({ error: 'Erro ao buscar tipos de refeição' });
  }
});

export default router;