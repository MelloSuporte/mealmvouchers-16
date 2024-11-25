import express from 'express';
import { searchUser, createUser, updateUser } from '../controllers/userController.js';

const router = express.Router();

router.get('/search', searchUser);
router.post('/', createUser);
router.put('/:id', updateUser);

export default router;