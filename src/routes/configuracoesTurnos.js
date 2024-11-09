import express from 'express';
import logger from '../config/logger.js';
import { supabase } from '../config/supabase.js';

const router = express.Router();

// Listar turnos
router.get('/', async (req, res) => {
  try {
    const { data: turnos, error } = await supabase
      .from('turnos')
      .select('*')
      .order('id');

    if (error) throw error;
    res.json(turnos || []);
  } catch (error) {
    logger.error('Erro ao buscar turnos:', error);
    res.status(500).json({ 
      error: 'Erro ao buscar turnos',
      details: error.message 
    });
  }
});

// Criar turno
router.post('/', async (req, res) => {
  try {
    const { shift_type, start_time, end_time, is_active } = req.body;
    
    if (!shift_type?.trim()) {
      return res.status(400).json({ error: 'Tipo de turno é obrigatório' });
    }
    if (!start_time?.trim()) {
      return res.status(400).json({ error: 'Horário de início é obrigatório' });
    }
    if (!end_time?.trim()) {
      return res.status(400).json({ error: 'Horário de fim é obrigatório' });
    }

    const { data: turno, error } = await supabase
      .from('turnos')
      .insert([{
        tipo: shift_type,
        hora_inicio: start_time,
        hora_fim: end_time,
        ativo: is_active,
        criado_em: new Date().toISOString(),
        atualizado_em: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(turno);
  } catch (error) {
    logger.error('Erro ao cadastrar turno:', error);
    res.status(500).json({ 
      error: 'Erro ao cadastrar turno',
      details: error.message 
    });
  }
});

// Atualizar turno
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { start_time, end_time, is_active } = req.body;
    
    if (!start_time?.trim()) {
      return res.status(400).json({ error: 'Horário de início é obrigatório' });
    }
    if (!end_time?.trim()) {
      return res.status(400).json({ error: 'Horário de fim é obrigatório' });
    }

    const { data: turno, error } = await supabase
      .from('turnos')
      .update({
        hora_inicio: start_time,
        hora_fim: end_time,
        ativo: is_active,
        atualizado_em: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    if (!turno) {
      return res.status(404).json({ error: 'Turno não encontrado' });
    }

    res.json(turno);
  } catch (error) {
    logger.error('Erro ao atualizar turno:', error);
    res.status(500).json({ 
      error: 'Erro ao atualizar turno',
      details: error.message 
    });
  }
});

export default router;