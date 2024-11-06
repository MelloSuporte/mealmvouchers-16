import express from 'express';
import pool from '../config/database.js';
import logger from '../config/logger.js';

const router = express.Router();

// Função auxiliar para executar queries com timeout e paginação
const executeQueryWithTimeout = async (query, params = [], pageSize = 1000) => {
  const connection = await pool.getConnection();
  try {
    // Define um timeout de 30 segundos
    await connection.query('SET SESSION MAX_EXECUTION_TIME=30000');
    
    // Adiciona LIMIT e OFFSET à query para paginação
    const paginatedQuery = `${query} LIMIT ? OFFSET ?`;
    
    let offset = 0;
    let allResults = [];
    
    while (true) {
      const [results] = await connection.execute(paginatedQuery, [...params, pageSize, offset]);
      if (results.length === 0) break;
      
      allResults = [...allResults, ...results];
      offset += pageSize;
      
      // Log do progresso
      logger.info(`Processados ${allResults.length} registros`);
    }
    
    return allResults;
  } finally {
    connection.release();
  }
};

router.get('/metrics', async (req, res) => {
  try {
    const [results] = await pool.execute(`
      SELECT 
        COUNT(*) as total_vouchers,
        SUM(CASE WHEN vu.user_id IN (SELECT id FROM users WHERE voucher IS NOT NULL) THEN 1 ELSE 0 END) as regular_vouchers,
        SUM(CASE WHEN vu.user_id IN (SELECT user_id FROM disposable_vouchers) THEN 1 ELSE 0 END) as disposable_vouchers,
        SUM(mt.value) as total_cost
      FROM voucher_usage vu
      JOIN meal_types mt ON vu.meal_type_id = mt.id
    `);
    
    const metrics = {
      totalCost: results[0].total_cost || 0,
      averageCost: results[0].total_cost / results[0].total_vouchers || 0,
      regularVouchers: results[0].regular_vouchers || 0,
      disposableVouchers: results[0].disposable_vouchers || 0
    };
    
    res.json(metrics);
  } catch (error) {
    logger.error('Erro ao buscar métricas:', error);
    res.status(500).json({ 
      error: 'Erro ao buscar métricas',
      details: error.message,
      type: 'METRICS_ERROR'
    });
  }
});

router.get('/usage', async (req, res) => {
  const { search = '', startDate, endDate, pageSize = 1000 } = req.query;
  
  try {
    const baseQuery = `
      SELECT 
        vu.id,
        DATE_FORMAT(vu.used_at, '%Y-%m-%d') as date,
        DATE_FORMAT(vu.used_at, '%H:%i') as time,
        u.name as userName,
        c.name as company,
        mt.name as mealType,
        CASE 
          WHEN dv.id IS NOT NULL THEN 'Descartável'
          ELSE 'Regular'
        END as voucherType,
        mt.value as cost
      FROM voucher_usage vu
      JOIN users u ON vu.user_id = u.id
      JOIN companies c ON u.company_id = c.id
      JOIN meal_types mt ON vu.meal_type_id = mt.id
      LEFT JOIN disposable_vouchers dv ON vu.user_id = dv.user_id AND DATE(vu.used_at) = DATE(dv.used_at)
      WHERE (u.name LIKE ? OR c.name LIKE ?)
      ${startDate ? 'AND vu.used_at >= ?' : ''}
      ${endDate ? 'AND vu.used_at <= ?' : ''}
      ORDER BY vu.used_at DESC
    `;

    const params = [`%${search}%`, `%${search}%`];
    if (startDate) params.push(startDate);
    if (endDate) params.push(endDate);

    const results = await executeQueryWithTimeout(baseQuery, params, parseInt(pageSize));
    
    res.json(results);
  } catch (error) {
    logger.error('Erro ao buscar histórico de uso:', error);
    res.status(500).json({ 
      error: 'Erro ao buscar histórico',
      details: error.message,
      type: 'USAGE_HISTORY_ERROR'
    });
  }
});

router.get('/export', async (req, res) => {
  try {
    const [data] = await pool.execute(`
      SELECT 
        v.code,
        u.name as user_name,
        c.name as company_name,
        v.created_at,
        v.used_at,
        v.used
      FROM vouchers v
      LEFT JOIN users u ON v.user_id = u.id
      LEFT JOIN companies c ON u.company_id = c.id
      ORDER BY v.created_at DESC
    `);
    
    res.json(data);
  } catch (error) {
    logger.error('Erro ao exportar dados:', error);
    res.status(500).json({ error: 'Erro ao exportar dados' });
  }
});

export default router;