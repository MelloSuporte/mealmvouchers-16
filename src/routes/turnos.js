import express from 'express';
import logger from '../config/logger.js';
import { authenticateToken } from '../middleware/security.js';
import { supabase } from '../config/supabase.js';

const router = express.Router();

// Aplicar middleware de autenticação para todas as rotas
router.use(authenticateToken);

// GET /turnos - Listar todos os turnos
router.get('/', async (req, res) => {
  try {
    logger.info('Iniciando busca de turnos');
    
    const { data: turnos, error } = await supabase
      .from('turnos')
      .select('*')
      .order('id');

    if (error) {
      logger.error('Erro ao buscar turnos do Supabase:', error);
      return res.status(500).json({ 
        erro: 'Erro ao buscar turnos',
        detalhes: error.message,
        code: error.code
      });
    }

    logger.info(`Turnos encontrados: ${turnos?.length || 0}`);
    res.json(turnos || []);
  } catch (erro) {
    logger.error('Erro inesperado ao buscar turnos:', erro);
    res.status(500).json({ 
      erro: 'Erro interno ao buscar turnos',
      detalhes: erro.message 
    });
  }
});

// POST /turnos - Criar novo turno
router.post('/', async (req, res) => {
  try {
    const { tipo, hora_inicio, hora_fim, ativo } = req.body;
    logger.info('Tentando criar novo turno:', { tipo, hora_inicio, hora_fim, ativo });
    
    // Validações
    if (!tipo?.trim()) {
      logger.warn('Tentativa de criar turno sem tipo');
      return res.status(400).json({ erro: 'Tipo de turno é obrigatório' });
    }
    if (!hora_inicio?.trim()) {
      logger.warn('Tentativa de criar turno sem hora de início');
      return res.status(400).json({ erro: 'Horário de início é obrigatório' });
    }
    if (!hora_fim?.trim()) {
      logger.warn('Tentativa de criar turno sem hora de fim');
      return res.status(400).json({ erro: 'Horário de fim é obrigatório' });
    }

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
      logger.error('Erro do Supabase ao criar turno:', error);
      return res.status(500).json({ 
        erro: 'Erro ao criar turno',
        detalhes: error.message,
        code: error.code
      });
    }

    logger.info('Turno criado com sucesso:', turno);
    res.status(201).json(turno);
  } catch (erro) {
    logger.error('Erro inesperado ao criar turno:', erro);
    res.status(500).json({ 
      erro: 'Erro interno ao criar turno',
      detalhes: erro.message 
    });
  }
});

export default router;