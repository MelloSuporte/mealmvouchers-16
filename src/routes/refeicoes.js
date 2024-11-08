import express from 'express';
import { supabase } from '../config/supabase.js';
import logger from '../config/logger.js';

const router = express.Router();

router.post('/', async (req, res) => {
  const { nome, hora_inicio, hora_fim, valor, ativo = true, max_usuarios_por_dia, minutos_tolerancia = 15 } = req.body;
  
  try {
    const { data: refeicao, error } = await supabase
      .from('tipos_refeicao')
      .insert([
        {
          nome,
          hora_inicio,
          hora_fim,
          valor,
          ativo,
          max_usuarios_por_dia,
          minutos_tolerancia
        }
      ])
      .select()
      .single();

    if (error) {
      logger.error('Erro ao criar tipo de refeição:', error);
      throw error;
    }

    res.status(201).json(refeicao);
  } catch (error) {
    logger.error('Erro ao criar tipo de refeição:', error);
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
      logger.error('Erro ao buscar tipos de refeição:', error);
      throw error;
    }

    res.json(refeicoes);
  } catch (error) {
    logger.error('Erro ao buscar tipos de refeição:', error);
    res.status(500).json({ error: 'Erro ao buscar tipos de refeição' });
  }
});

export default router;