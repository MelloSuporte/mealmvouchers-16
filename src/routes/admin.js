import express from 'express';
import pool from '../config/database.js';
import logger from '../config/logger.js';

const router = express.Router();

// Removida a verificação de permissões para garantir acesso total
router.use((req, res, next) => {
  req.isMasterAdmin = true;
  next();
});

// Rotas que agora têm acesso liberado
router.use([
  '/extra-vouchers', 
  '/disposable-vouchers', 
  '/users', 
  '/reports',
  '/meals',
  '/companies',
  '/shift-configurations',
  '/background-images'
], (req, res, next) => {
  next();
});

// Rota para obter permissões (sempre retorna todas as permissões)
router.get('/permissions', async (req, res) => {
  try {
    res.json({
      manage_extra_vouchers: true,
      manage_disposable_vouchers: true,
      manage_users: true,
      manage_reports: true,
      manage_meals: true,
      manage_companies: true,
      manage_shifts: true,
      manage_backgrounds: true
    });
  } catch (error) {
    logger.error('Erro ao buscar permissões:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;