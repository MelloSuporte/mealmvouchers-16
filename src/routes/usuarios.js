import express from 'express';
import { searchUser, createUser, updateUser } from '../controllers/userController.js';

const router = express.Router();

// Rotas com tratamento de erro unificado
router.get('/search', async (req, res) => {
  try {
    await searchUser(req, res);
  } catch (error) {
    res.status(500).json({
      erro: 'Erro interno do servidor',
      mensagem: error.message
    });
  }
});

router.post('/', async (req, res) => {
  try {
    await createUser(req, res);
  } catch (error) {
    res.status(500).json({
      erro: 'Erro ao criar usuário',
      mensagem: error.message
    });
  }
});

router.put('/:id', async (req, res) => {
  try {
    await updateUser(req, res);
  } catch (error) {
    res.status(500).json({
      erro: 'Erro ao atualizar usuário',
      mensagem: error.message
    });
  }
});

export default router;