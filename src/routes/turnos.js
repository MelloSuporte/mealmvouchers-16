import express from 'express';
import logger from '../config/logger.js';
import supabase from '../config/database.js';

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
  } catch (erro) {
    logger.error('Erro ao buscar turnos:', erro);
    res.status(500).json({ 
      erro: 'Erro ao buscar turnos',
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

    if (error) throw error;

    res.status(201).json(turno);
  } catch (erro) {
    logger.error('Erro ao cadastrar turno:', erro);
    res.status(500).json({ 
      erro: 'Erro ao cadastrar turno',
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

    if (error) throw error;

    if (!turno) {
      return res.status(404).json({ erro: 'Turno não encontrado' });
    }

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