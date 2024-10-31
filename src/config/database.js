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
      keepAliveInitialDelay: 0
    });

    logger.info('Pool de conexão MySQL criado com sucesso');
    return pool;
  } catch (error) {
    logger.error('Erro ao criar pool de conexão:', error);
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
    logger.error('Erro ao testar conexão:', error);
    return false;
  }
};

// Testar conexão periodicamente
setInterval(async () => {
  try {
    await testConnection();
    logger.info('Conexão com banco de dados OK');
  } catch (error) {
    logger.error('Erro na verificação de conexão:', error);
  }
}, 30000);

export default pool;