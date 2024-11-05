import express from 'express';
import pool from '../config/database.js';
import logger from '../config/logger.js';

const router = express.Router();

// Middleware para verificar permissões do admin
const checkAdminPermissions = async (req, res, next) => {
  const adminToken = req.headers.authorization?.split(' ')[1];
  
  // Se for admin master, permite acesso total
  if (adminToken === 'admin-authenticated') {
    req.isMasterAdmin = true;
    return next();
  }

  try {
    const [admin] = await pool.execute(
      'SELECT * FROM admin_users WHERE id = ?',
      [req.adminId]
    );

    if (!admin) {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    const [permissions] = await pool.execute(
      'SELECT * FROM admin_permissions WHERE admin_id = ?',
      [admin.id]
    );

    req.adminPermissions = permissions;

    // Verifica permissões específicas baseado na rota
    const path = req.path;
    if (path.includes('/extra-vouchers') && !permissions.manage_extra_vouchers) {
      return res.status(403).json({ error: 'Sem permissão para gerenciar vouchers extra' });
    }
    if (path.includes('/disposable-vouchers') && !permissions.manage_disposable_vouchers) {
      return res.status(403).json({ error: 'Sem permissão para gerenciar vouchers descartáveis' });
    }
    if (path.includes('/users') && !permissions.manage_users) {
      return res.status(403).json({ error: 'Sem permissão para gerenciar usuários' });
    }
    if (path.includes('/reports') && !permissions.manage_reports) {
      return res.status(403).json({ error: 'Sem permissão para acessar relatórios' });
    }

    next();
  } catch (error) {
    logger.error('Erro ao verificar permissões:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Rotas que requerem verificação de permissões
router.use([
  '/extra-vouchers', 
  '/disposable-vouchers', 
  '/users', 
  '/reports'
], checkAdminPermissions);

// Rotas restritas apenas para admin master
router.use([
  '/meals',
  '/companies',
  '/shift-configurations',
  '/background-images'
], (req, res, next) => {
  if (req.isMasterAdmin) {
    next();
  } else {
    res.status(403).json({ error: 'Acesso restrito ao admin master' });
  }
});

// Rotas para obter permissões
router.get('/permissions', async (req, res) => {
  try {
    const [permissions] = await pool.execute(
      'SELECT * FROM admin_permissions WHERE admin_id = ?',
      [req.adminId]
    );
    res.json(permissions);
  } catch (error) {
    logger.error('Erro ao buscar permissões:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;