import express from 'express';
import pool from '../config/database';

const router = express.Router();

router.get('/metrics', async (req, res) => {
  try {
    const db = await pool.getConnection();
    const [results] = await db.execute(`
      SELECT 
        COUNT(*) as total_vouchers,
        SUM(CASE WHEN voucher_type = 'regular' THEN 1 ELSE 0 END) as regular_vouchers,
        SUM(CASE WHEN voucher_type = 'disposable' THEN 1 ELSE 0 END) as disposable_vouchers,
        SUM(cost) as total_cost
      FROM voucher_usage
    `);
    
    const metrics = {
      totalCost: results[0].total_cost || 0,
      averageCost: results[0].total_cost / results[0].total_vouchers || 0,
      regularVouchers: results[0].regular_vouchers || 0,
      disposableVouchers: results[0].disposable_vouchers || 0
    };
    
    res.json(metrics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/usage', async (req, res) => {
  const { search } = req.query;
  try {
    const db = await pool.getConnection();
    const [results] = await db.execute(`
      SELECT 
        vu.id,
        DATE_FORMAT(vu.used_at, '%Y-%m-%d') as date,
        DATE_FORMAT(vu.used_at, '%H:%i') as time,
        u.name as userName,
        c.name as company,
        mt.name as mealType,
        vu.voucher_type,
        mt.value as cost
      FROM voucher_usage vu
      JOIN users u ON vu.user_id = u.id
      JOIN companies c ON u.company_id = c.id
      JOIN meal_types mt ON vu.meal_type_id = mt.id
      WHERE u.name LIKE ? OR c.name LIKE ?
      ORDER BY vu.used_at DESC
    `, [`%${search}%`, `%${search}%`]);
    
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/weekly', async (req, res) => {
  try {
    const db = await pool.getConnection();
    const [results] = await db.execute(`
      SELECT 
        DAYNAME(used_at) as name,
        COUNT(CASE WHEN mt.name = 'Almoço' THEN 1 END) as Almoço,
        COUNT(CASE WHEN mt.name = 'Jantar' THEN 1 END) as Jantar,
        COUNT(CASE WHEN mt.name = 'Café' THEN 1 END) as Café
      FROM voucher_usage vu
      JOIN meal_types mt ON vu.meal_type_id = mt.id
      WHERE used_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
      GROUP BY DAYNAME(used_at)
      ORDER BY DAYOFWEEK(used_at)
    `);
    
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/distribution', async (req, res) => {
  try {
    const db = await pool.getConnection();
    const [results] = await db.execute(`
      SELECT 
        mt.name,
        COUNT(*) as value
      FROM voucher_usage vu
      JOIN meal_types mt ON vu.meal_type_id = mt.id
      GROUP BY mt.name
    `);
    
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/trend', async (req, res) => {
  try {
    const db = await pool.getConnection();
    const [results] = await db.execute(`
      SELECT 
        DATE_FORMAT(used_at, '%d/%m') as name,
        COUNT(*) as total
      FROM voucher_usage
      WHERE used_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
      GROUP BY DATE(used_at)
      ORDER BY used_at
    `);
    
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/export', async (req, res) => {
  try {
    const db = await pool.getConnection();
    const [results] = await db.execute(`
      SELECT 
        DATE_FORMAT(vu.used_at, '%Y-%m-%d') as Data,
        DATE_FORMAT(vu.used_at, '%H:%i') as Hora,
        u.name as Usuario,
        c.name as Empresa,
        mt.name as Refeicao,
        vu.voucher_type as Tipo,
        mt.value as Custo
      FROM voucher_usage vu
      JOIN users u ON vu.user_id = u.id
      JOIN companies c ON u.company_id = c.id
      JOIN meal_types mt ON vu.meal_type_id = mt.id
      ORDER BY vu.used_at DESC
    `);
    
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;