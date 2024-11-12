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
      .select('id, tipo_turno, horario_inicio, horario_fim, ativo')
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

export default router;