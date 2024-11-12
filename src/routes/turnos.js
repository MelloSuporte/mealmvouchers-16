import express from 'express';
import { supabase } from '../config/supabase.js';
import logger from '../config/logger.js';
import { authenticateToken } from '../middleware/security.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', async (req, res) => {
  try {
    logger.info('Buscando turnos...');
    const { data: turnos, error } = await supabase
      .from('turnos')
      .select('id, tipo, hora_inicio, hora_fim, ativo')
      .eq('ativo', true)
      .order('id');

    if (error) {
      logger.error('Erro Supabase ao buscar turnos:', error);
      throw error;
    }

    logger.info(`${turnos?.length || 0} turnos encontrados`);
    res.json(turnos || []);
  } catch (erro) {
    logger.error('Erro ao buscar turnos:', erro);
    res.status(500).json({ 
      erro: 'Erro ao buscar turnos',
      detalhes: erro.message 
    });
  }
});

router.post('/', async (req, res) => {
  try {
    const { tipo, hora_inicio, hora_fim, ativo } = req.body;
    logger.info('Criando novo turno:', { tipo, hora_inicio, hora_fim, ativo });
    
    if (!tipo?.trim()) {
      return res.status(400).json({ erro: 'Tipo de turno é obrigatório' });
    }
    if (!hora_inicio?.trim()) {
      return res.status(400).json({ erro: 'Horário de início é obrigatório' });
    }
    if (!hora_fim?.trim()) {
      return res.status(400).json({ erro: 'Horário de fim é obrigatório' });
    }

    const { data: novoTurno, error } = await supabase
      .from('turnos')
      .insert([{
        tipo,
        hora_inicio,
        hora_fim,
        ativo: ativo ?? true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) {
      logger.error('Erro Supabase ao criar turno:', error);
      throw error;
    }

    logger.info('Turno criado com sucesso:', novoTurno);
    res.status(201).json(novoTurno);
  } catch (erro) {
    logger.error('Erro ao criar turno:', erro);
    res.status(500).json({ 
      erro: 'Erro ao criar turno',
      detalhes: erro.message 
    });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { hora_inicio, hora_fim, ativo } = req.body;
    
    const { data: turno, error } = await supabase
      .from('turnos')
      .update({
        hora_inicio,
        hora_fim,
        ativo,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      logger.error('Erro Supabase ao atualizar turno:', error);
      throw error;
    }

    logger.info('Turno atualizado com sucesso:', turno);
    res.json(turno);
  } catch (erro) {
    logger.error('Erro ao atualizar turno:', erro);
    res.status(500).json({ 
      erro: 'Erro ao atualizar turno',
      detalhes: erro.message 
    });
  }
});

export default router;