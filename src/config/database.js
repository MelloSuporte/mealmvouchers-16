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
      connectionLimit: 20, // Aumentado o limite de conexões
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0,
      timezone: '-03:00',
      dateStrings: true,
      connectTimeout: 60000, // Aumentado timeout de conexão
      acquireTimeout: 60000 // Aumentado timeout de aquisição
    });

    logger.info('MySQL connection pool created successfully');
    return pool;
  } catch (error) {
    logger.error('Error creating connection pool:', error);
    throw error;
  }
};

const pool = createPool();

// Função para verificar e reconectar se necessário
const ensureConnection = async () => {
  try {
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    return true;
  } catch (error) {
    logger.error('Database connection lost, attempting to reconnect:', error);
    pool.end(); // Fecha todas as conexões
    createPool(); // Recria o pool
    return false;
  }
};

// Verifica conexão a cada 30 segundos
setInterval(async () => {
  await ensureConnection();
}, 30000);

export const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    await connection.ping();
    
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

export default pool;