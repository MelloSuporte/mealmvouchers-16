import pool from '../config/database.js';
import logger from '../config/logger.js';

const MAINTENANCE_MODE = process.env.MAINTENANCE_MODE === 'true';

const checkMaintenanceMode = (req, res, next) => {
  if (MAINTENANCE_MODE) {
    logger.warn('Tentativa de modificação durante modo manutenção:', {
      path: req.path,
      method: req.method,
      user: req.user
    });
    return res.status(503).json({
      error: "Sistema em manutenção",
      message: "Esta funcionalidade está temporariamente bloqueada para manutenção"
    });
  }
  return next();
};

export const getMeals = async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
    const [results] = await connection.execute(
      'SELECT * FROM meal_types ORDER BY name'
    );
    res.json(results);
  } catch (error) {
    logger.error('Error fetching meals:', error);
    res.status(500).json({ error: 'Erro ao buscar refeições. Por favor, tente novamente.' });
  } finally {
    if (connection) connection.release();
  }
};

export const createMeal = async (req, res) => {
  if (checkMaintenanceMode(req, res, () => {})) return;

  const { name, startTime, endTime, value, isActive, maxUsersPerDay, toleranceMinutes } = req.body;
  let connection;
  
  try {
    connection = await pool.getConnection();
    const [result] = await connection.execute(
      'INSERT INTO meal_types (name, start_time, end_time, value, is_active, max_users_per_day, tolerance_minutes) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, startTime, endTime, value, isActive ?? true, maxUsersPerDay || null, toleranceMinutes || 15]
    );
    
    logger.info('Nova refeição cadastrada:', { id: result.insertId, name });
    
    res.status(201).json({ 
      success: true, 
      id: result.insertId,
      message: 'Refeição cadastrada com sucesso'
    });
  } catch (error) {
    logger.error('Error creating meal:', error);
    res.status(500).json({ error: 'Erro ao cadastrar refeição. Por favor, verifique os dados e tente novamente.' });
  } finally {
    if (connection) connection.release();
  }
};

export const updateMealStatus = async (req, res) => {
  if (checkMaintenanceMode(req, res, () => {})) return;

  const { id } = req.params;
  const { is_active } = req.body;
  let connection;
  
  try {
    connection = await pool.getConnection();
    await connection.execute(
      'UPDATE meal_types SET is_active = ? WHERE id = ?',
      [is_active, id]
    );
    
    logger.info('Status da refeição atualizado:', { id, is_active });
    
    res.json({ success: true });
  } catch (error) {
    logger.error('Error updating meal:', error);
    res.status(500).json({ error: 'Erro ao atualizar status da refeição.' });
  } finally {
    if (connection) connection.release();
  }
};