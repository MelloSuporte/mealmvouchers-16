import express from 'express';
import { searchUser, createUser, updateUser } from '../controllers/userController.js';

const router = express.Router();

router.get('/search', (req, res, next) => {
  searchUser(req, res).catch(next);
});

router.post('/', (req, res, next) => {
  createUser(req, res).catch(next);
});

router.put('/:id', (req, res, next) => {
  updateUser(req, res).catch(next);
});

export default router;