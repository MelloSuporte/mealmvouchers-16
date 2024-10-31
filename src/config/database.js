import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import logger from './logger.js';

dotenv.config();

const MAX_RETRIES = 3;
const RETRY_DELAY = 5000; // 5 segundos

const createPool = () => {
  try {
    const pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME || 'sis_voucher',
      waitForConnections: true,
      connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT) || 10,
      queueLimit: parseInt(process.env.DB_QUEUE_LIMIT) || 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0,
      connectTimeout: parseInt(process.env.DB_CONNECT_TIMEOUT) || 30000,
      ssl: process.env.NODE_ENV === 'production' ? {
        rejectUnauthorized: false
      } : false
    });

    logger.info('Pool de conexão MySQL criado com sucesso');
    logger.info(`Conectando ao MySQL em ${process.env.DB_HOST}`);
    
    return pool;
  } catch (error) {
    logger.error('Erro ao criar pool de conexão:', error);
    throw error;
  }
};

const pool = createPool();

const testConnectionWithRetry = async (retries = MAX_RETRIES) => {
  try {
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    logger.info('Conexão com o banco de dados estabelecida com sucesso');
    return true;
  } catch (error) {
    logger.error('Erro ao testar conexão:', error);
    
    if (retries > 0) {
      logger.info(`Tentando reconectar em ${RETRY_DELAY/1000} segundos... (${retries} tentativas restantes)`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return testConnectionWithRetry(retries - 1);
    }
    
    logger.error('Todas as tentativas de conexão falharam');
    return false;
  }
};

// Iniciar teste de conexão imediatamente
testConnectionWithRetry();

// Verificar conexão periodicamente
setInterval(() => {
  testConnectionWithRetry(1);
}, 60000); // Verifica a cada minuto

export const getConnection = async () => {
  try {
    const connection = await pool.getConnection();
    return connection;
  } catch (error) {
    logger.error('Erro ao obter conexão:', error);
    throw new Error('Não foi possível obter uma conexão com o banco de dados');
  }
};

export default pool;