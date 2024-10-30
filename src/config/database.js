import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import logger from './logger.js';

dotenv.config();

const createPool = () => {
  try {
    const pool = mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      ssl: process.env.NODE_ENV === 'production' ? {
        rejectUnauthorized: true
      } : false
    });

    // Teste a conexão
    pool.getConnection()
      .then(connection => {
        logger.info('Database connection established successfully');
        connection.release();
      })
      .catch(err => {
        logger.error('Failed to connect to database:', err);
        throw err;
      });

    return pool;
  } catch (error) {
    logger.error('Error creating database pool:', error);
    throw error;
  }
};

const pool = createPool();

export const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    connection.release();
    return true;
  } catch (error) {
    logger.error('Database connection test failed:', error);
    return false;
  }
};

export default pool;