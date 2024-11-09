import express from 'express';
import { supabase } from '../config/supabase.js';
import logger from '../config/logger.js';

const router = express.Router();

router.post('/', async (req, res) => {
  const { nome, hora_inicio, hora_fim, valor, ativo = true, minutos_tolerancia = 15 } = req.body;
  
  try {
    logger.info('Criando tipo de refeição:', { nome, hora_inicio, hora_fim, valor });

    const { data: meal, error } = await supabase
      .from('tipos_refeicao')
      .insert([{
        nome,
        hora_inicio,
        hora_fim,
        valor,
        ativo,
        minutos_tolerancia
      }])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(meal);
  } catch (error) {
    logger.error('Erro ao criar tipo de refeição:', error);
    res.status(500).json({ 
      error: 'Erro ao criar tipo de refeição',
      details: error.message 
    });
  }
});

router.get('/', async (req, res) => {
  try {
    const { data: meals, error } = await supabase
      .from('tipos_refeicao')
      .select('*')
      .order('nome');

    if (error) throw error;

    res.json(meals);
  } catch (error) {
    logger.error('Erro ao buscar refeições:', error);
    res.status(500).json({ 
      error: 'Erro ao buscar refeições',
      details: error.message 
    });
  }
});

router.patch('/:id', async (req, res) => {
  const { id } = req.params;
  const { ativo } = req.body;

  try {
    const { data, error } = await supabase
      .from('tipos_refeicao')
      .update({ ativo })
      .eq('id', id)
      .select();

    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    logger.error('Erro ao atualizar status da refeição:', error);
    res.status(500).json({ 
      error: 'Erro ao atualizar status da refeição',
      details: error.message 
    });
  }
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const { error } = await supabase
      .from('tipos_refeicao')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    logger.error('Erro ao deletar refeição:', error);
    res.status(500).json({ 
      error: 'Erro ao deletar refeição',
      details: error.message 
    });
  }
});

export default router;