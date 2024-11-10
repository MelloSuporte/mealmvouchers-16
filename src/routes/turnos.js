import express from 'express';
import logger from '../config/logger.js';
import supabase from '../config/database.js';
import { authenticateToken } from '../middleware/security.js';

const router = express.Router();

// Aplicar middleware de autenticação em todas as rotas
router.use(authenticateToken);

// Listar turnos
router.get('/', async (req, res) => {
  try {
    logger.info('Buscando lista de turnos');
    const { data: turnos, error } = await supabase
      .from('turnos')
      .select('*')
      .order('id');

    if (error) {
      logger.error('Erro ao buscar turnos:', error);
      return res.status(500).json({ 
        erro: 'Erro ao buscar turnos',
        detalhes: error.message 
      });
    }

    res.json(turnos || []);
  } catch (erro) {
    logger.error('Erro ao processar requisição de turnos:', erro);
    res.status(500).json({ 
      erro: 'Erro interno ao processar requisição',
      detalhes: erro.message 
    });
  }
});

// Criar turno
router.post('/', async (req, res) => {
  try {
    const { tipo, hora_inicio, hora_fim, ativo } = req.body;
    
    if (!tipo?.trim()) {
      return res.status(400).json({ erro: 'Tipo de turno é obrigatório' });
    }
    if (!hora_inicio?.trim()) {
      return res.status(400).json({ erro: 'Horário de início é obrigatório' });
    }
    if (!hora_fim?.trim()) {
      return res.status(400).json({ erro: 'Horário de fim é obrigatório' });
    }

    logger.info('Criando novo turno:', { tipo, hora_inicio, hora_fim });
    const { data: turno, error } = await supabase
      .from('turnos')
      .insert([{
        tipo,
        hora_inicio,
        hora_fim,
        ativo,
        criado_em: new Date().toISOString(),
        atualizado_em: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) {
      logger.error('Erro ao criar turno:', error);
      return res.status(500).json({ 
        erro: 'Erro ao criar turno',
        detalhes: error.message 
      });
    }

    res.status(201).json(turno);
  } catch (erro) {
    logger.error('Erro ao processar criação de turno:', erro);
    res.status(500).json({ 
      erro: 'Erro interno ao criar turno',
      detalhes: erro.message 
    });
  }
});

// Atualizar turno
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { hora_inicio, hora_fim, ativo } = req.body;
    
    if (!hora_inicio?.trim()) {
      return res.status(400).json({ erro: 'Horário de início é obrigatório' });
    }
    if (!hora_fim?.trim()) {
      return res.status(400).json({ erro: 'Horário de fim é obrigatório' });
    }

    logger.info('Atualizando turno:', { id, hora_inicio, hora_fim, ativo });
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
      logger.error('Erro ao atualizar turno:', error);
      return res.status(500).json({ 
        erro: 'Erro ao atualizar turno',
        detalhes: error.message 
      });
    }

    if (!turno) {
      return res.status(404).json({ erro: 'Turno não encontrado' });
    }

    res.json(turno);
  } catch (erro) {
    logger.error('Erro ao processar atualização de turno:', erro);
    res.status(500).json({ 
      erro: 'Erro interno ao atualizar turno',
      detalhes: erro.message 
    });
  }
});

export default router;