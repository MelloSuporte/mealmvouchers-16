import express from 'express';
import { searchUser, createUser, updateUser } from '../controllers/userController.js';
import { supabase } from '../config/supabase.js';
import logger from '../config/logger.js';

const router = express.Router();

// Rota de busca de usuário
router.get('/search', async (req, res) => {
  try {
    const result = await searchUser(req, res);
    return result;
  } catch (error) {
    logger.error('Erro na rota de busca:', error);
    return res.status(500).json({
      error: 'Erro ao buscar usuário',
      details: error.message
    });
  }
});

// Rota de criação de usuário
router.post('/', async (req, res) => {
  try {
    const result = await createUser(req, res);
    return result;
  } catch (error) {
    logger.error('Erro na rota de criação:', error);
    return res.status(500).json({
      error: 'Erro ao criar usuário',
      details: error.message
    });
  }
});

// Rota de atualização de usuário
router.put('/:id', async (req, res) => {
  try {
    const result = await updateUser(req, res);
    return result;
  } catch (error) {
    logger.error('Erro na rota de atualização:', error);
    return res.status(500).json({
      error: 'Erro ao atualizar usuário',
      details: error.message
    });
  }
});

export default router;