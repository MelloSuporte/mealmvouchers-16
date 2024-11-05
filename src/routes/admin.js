import express from 'express';
import pool from '../config/database.js';
import logger from '../config/logger.js';

const router = express.Router();

// Middleware para verificar se é admin master
const checkMasterAdmin = async (req, res, next) => {
  const adminToken = req.headers.authorization?.split(' ')[1];
  
  if (adminToken !== '0001000') {
    return res.status(403).json({ 
      error: 'Acesso negado. Apenas administrador master pode acessar esta funcionalidade.' 
    });
  }
  next();
};

// Rotas protegidas que requerem admin master
router.use(['/meals', '/shifts', '/companies', '/backgrounds'], checkMasterAdmin);

export default router;