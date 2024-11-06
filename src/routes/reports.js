import express from 'express';
import pool from '../config/database.js';
import logger from '../config/logger.js';

const router = express.Router();

// Get report metrics
router.get('/metrics', async (req, res) => {
  try {
    const [metrics] = await pool.execute(`
      SELECT 
        COUNT(*) as total_vouchers,
        SUM(CASE WHEN used = 1 THEN 1 ELSE 0 END) as used_vouchers,
        SUM(CASE WHEN used = 0 THEN 1 ELSE 0 END) as available_vouchers
      FROM vouchers
    `);
    
    res.json(metrics[0]);
  } catch (error) {
    logger.error('Error fetching report metrics:', error);
    res.status(500).json({ error: 'Failed to fetch report metrics' });
  }
});

// Get usage history
router.get('/usage', async (req, res) => {
  try {
    const [history] = await pool.execute(`
      SELECT 
        v.id,
        v.code,
        v.created_at,
        v.used_at,
        u.name as user_name,
        c.name as company_name
      FROM vouchers v
      LEFT JOIN users u ON v.user_id = u.id
      LEFT JOIN companies c ON v.company_id = c.id
      ORDER BY v.created_at DESC
      LIMIT 100
    `);
    
    res.json(history);
  } catch (error) {
    logger.error('Error fetching usage history:', error);
    res.status(500).json({ error: 'Failed to fetch usage history' });
  }
});

// Export data
router.get('/export', async (req, res) => {
  try {
    const [data] = await pool.execute(`
      SELECT 
        v.code,
        v.created_at,
        v.used_at,
        u.name as user_name,
        c.name as company_name,
        CASE WHEN v.used = 1 THEN 'Sim' ELSE 'Não' END as used
      FROM vouchers v
      LEFT JOIN users u ON v.user_id = u.id
      LEFT JOIN companies c ON v.company_id = c.id
      ORDER BY v.created_at DESC
    `);
    
    res.json(data);
  } catch (error) {
    logger.error('Error exporting report data:', error);
    res.status(500).json({ error: 'Failed to export report data' });
  }
});

export default router;