import express from 'express';
import { searchUser, createUser, updateUser } from '../controllers/userController.js';
import { supabase } from '../config/supabase.js';
import logger from '../config/logger.js';

const router = express.Router();

// Rota de busca de usuário
router.get('/search', (req, res, next) => {
  searchUser(req, res).catch(next);
});

// Rota de criação de usuário
router.post('/', (req, res, next) => {
  createUser(req, res).catch(next);
});

// Rota de atualização de usuário
router.put('/:id', (req, res, next) => {
  updateUser(req, res).catch(next);
});

export default router;