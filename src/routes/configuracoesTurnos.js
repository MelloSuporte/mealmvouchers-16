import express from 'express';
import { supabase } from '../config/supabase.js';
import logger from '../config/logger.js';

const router = express.Router();

// Get all shift configurations
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('turnos')
      .select('*')
      .order('id');

    if (error) throw error;

    return data.map(turno => ({
      id: turno.id,
      shift_type: turno.tipo,
      start_time: turno.hora_inicio,
      end_time: turno.hora_fim,
      is_active: turno.ativo,
      created_at: turno.criado_em,
      updated_at: turno.atualizado_em
    }));
  } catch (error) {
    console.error('Erro ao carregar turnos:', error);
    res.status(500).json({ error: 'Erro ao carregar turnos: ' + error.message });
    return [];
  }
});

// Create new shift configuration
router.post('/', async (req, res) => {
  const { shift_type, start_time, end_time, is_active } = req.body;
  
  try {
    const { data, error } = await supabase
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

    res.status(201).json({
      id: data.id,
      shift_type: data.tipo,
      start_time: data.hora_inicio,
      end_time: data.hora_fim,
      is_active: data.ativo,
      created_at: data.criado_em,
      updated_at: data.atualizado_em
    });
  } catch (error) {
    console.error('Erro ao criar turno:', error);
    res.status(500).json({ error: 'Erro ao criar turno: ' + error.message });
  }
});

// Update shift configuration
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { start_time, end_time, is_active } = req.body;
  
  try {
    const { data, error } = await supabase
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

    if (!data) {
      return res.status(404).json({ error: 'Turno não encontrado' });
    }
    
    res.json({
      id: data.id,
      shift_type: data.tipo,
      start_time: data.hora_inicio,
      end_time: data.hora_fim,
      is_active: data.ativo,
      created_at: data.criado_em,
      updated_at: data.atualizado_em
    });
  } catch (error) {
    console.error('Erro ao atualizar turno:', error);
    res.status(500).json({ error: 'Erro ao atualizar turno: ' + error.message });
  }
});

export default router;