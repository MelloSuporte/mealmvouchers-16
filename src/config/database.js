import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import logger from './logger.js';

dotenv.config();

const createPool = () => {
  try {
    const pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME || 'sis_voucher',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0,
      connectTimeout: 30000,
      ssl: process.env.NODE_ENV === 'production' ? {
        rejectUnauthorized: false
      } : false
    });

    // Test connection
    pool.getConnection()
      .then(connection => {
        logger.info('Database connection established successfully');
        logger.info(`Connected to MySQL at ${process.env.DB_HOST}`);
        connection.release();
      })
      .catch(err => {
        logger.error('Failed to connect to database:', err);
        logger.error(`Connection details: host=${process.env.DB_HOST}, user=${process.env.DB_USER}, database=${process.env.DB_NAME}`);
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
    await connection.ping();
    connection.release();
    return true;
  } catch (error) {
    logger.error('Database connection test failed:', error);
    return false;
  }
};

export default pool;