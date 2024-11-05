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
      timezone: '-03:00', // Configurando timezone para GMT-3 (Brasília)
      dateStrings: true
    });

    logger.info('MySQL connection pool created successfully');
    return pool;
  } catch (error) {
    logger.error('Error creating connection pool:', error);
    throw error;
  }
};

const pool = createPool();

export const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    await connection.ping();
    
    // Test timezone settings
    const [rows] = await connection.execute('SELECT NOW() as server_time');
    logger.info(`Database server time: ${rows[0].server_time}`);
    
    connection.release();
    logger.info('Database connection test successful');
    return true;
  } catch (error) {
    logger.error('Database connection test failed:', error);
    return false;
  }
};

// Test connection periodically
setInterval(async () => {
  const isConnected = await testConnection();
  if (!isConnected) {
    logger.error('Periodic database connection check failed');
  }
}, 30000);

export default pool;