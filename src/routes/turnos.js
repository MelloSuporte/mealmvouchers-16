import express from 'express';
import { supabase } from '../config/supabase.js';
import logger from '../config/logger.js';
import { authenticateToken } from '../middleware/security.js';

const router = express.Router();

// Aplicar middleware de autenticação para todas as rotas
router.use(authenticateToken);

// GET /turnos - Listar todos os turnos
router.get('/', async (req, res) => {
  try {
    logger.info('Buscando turnos...');
    const { data: turnos, error } = await supabase
      .from('turnos')
      .select('*')
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

// POST /turnos - Criar novo turno
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

    const { data: turno, error } = await supabase
      .from('turnos')
      .insert([{
        tipo,
        hora_inicio,
        hora_fim,
        ativo: ativo ?? true,
        criado_em: new Date().toISOString(),
        atualizado_em: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) {
      logger.error('Erro Supabase ao criar turno:', error);
      throw error;
    }

    logger.info('Turno criado com sucesso:', turno);
    res.status(201).json(turno);
  } catch (erro) {
    logger.error('Erro ao criar turno:', erro);
    res.status(500).json({ 
      erro: 'Erro ao criar turno',
      detalhes: erro.message 
    });
  }
});

// PUT /turnos/:id - Atualizar turno existente
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
        atualizado_em: new Date().toISOString()
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