import express from 'express';
import { searchUser, createUser, updateUser } from '../controllers/userController.js';

const router = express.Router();

// Simplificando as rotas para usar async/await diretamente
router.get('/search', async (req, res, next) => {
  try {
    await searchUser(req, res);
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    await createUser(req, res);
  } catch (error) {
    next(error);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    await updateUser(req, res);
  } catch (error) {
    next(error);
  }
});

export default router;