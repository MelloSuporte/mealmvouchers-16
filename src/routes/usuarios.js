import express from 'express';
import { searchUser, createUser, updateUser } from '../controllers/userController.js';
import logger from '../config/logger.js';

const router = express.Router();

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch((error) => {
    logger.error('Erro na rota:', error);
    res.status(500).json({
      erro: 'Erro interno do servidor',
      mensagem: process.env.NODE_ENV === 'development' ? error.message : 'Ocorreu um erro ao processar sua requisição'
    });
  });
};

router.get('/search', asyncHandler(searchUser));
router.post('/', asyncHandler(createUser));
router.put('/:id', asyncHandler(updateUser));

export default router;