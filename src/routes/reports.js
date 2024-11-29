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
  const { search = '' } = req.query;
  try {
    const { data, error } = await supabase
      .from('vw_uso_voucher_detalhado')
      .select('*')
      .or(`nome_usuario.ilike.%${search}%,cpf.ilike.%${search}%,empresa.ilike.%${search}%`)
      .order('usado_em', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    logger.error('Error fetching usage history:', error);
    res.status(500).json({ error: 'Failed to fetch usage history' });
  }
});

// Export data
router.get('/export', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('vw_uso_voucher_detalhado')
      .select('*')
      .order('usado_em', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    logger.error('Error exporting report data:', error);
    res.status(500).json({ error: 'Failed to export report data' });
  }
});

export default router;