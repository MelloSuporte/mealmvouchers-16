import express from 'express';
import { searchUser, createUser, updateUser } from '../controllers/userController.js';
import { supabase } from '../config/supabase.js';
import logger from '../config/logger.js';

const router = express.Router();

// Rota de busca de usuário
router.get('/search', async (req, res, next) => {
  try {
    await searchUser(req, res);
  } catch (error) {
    next(error);
  }
});

// Rota de criação de usuário
router.post('/', async (req, res, next) => {
  try {
    await createUser(req, res);
  } catch (error) {
    next(error);
  }
});

// Rota de atualização de usuário
router.put('/:id', async (req, res, next) => {
  try {
    await updateUser(req, res);
  } catch (error) {
    next(error);
  }
});

export default router;