import pool from '../config/database.js';
import logger from '../config/logger.js';

export const executeQuery = async (query, params = []) => {
  let connection;
  try {
    connection = await pool.getConnection();
    logger.info(`Executing query: ${query}`);
    const [results] = await connection.execute(query, params);
    return results;
  } catch (error) {
    logger.error('Database query error:', error);
    throw error;
  } finally {
    if (connection) {
      connection.release();
    }
  }
};