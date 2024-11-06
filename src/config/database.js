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
      connectionLimit: 50,
      maxIdle: 10,
      idleTimeout: 60000,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0,
      timezone: '-03:00',
      dateStrings: true,
      connectTimeout: 60000
    });

    logger.info('Pool de conexões MySQL criado com sucesso');
    return pool;
  } catch (error) {
    logger.error('Erro ao criar pool de conexões:', error);
    throw error;
  }
};

let pool = createPool();

const ensureConnection = async () => {
  try {
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    return true;
  } catch (error) {
    logger.error('Conexão com banco perdida, tentando reconectar:', error);
    await pool.end();
    pool = createPool();
    return false;
  }
};

// Verifica conexão a cada 15 segundos
setInterval(async () => {
  await ensureConnection();
}, 15000);

export const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    await connection.ping();
    
    const [rows] = await connection.execute('SELECT NOW() as server_time');
    logger.info(`Horário do servidor de banco: ${rows[0].server_time}`);
    
    connection.release();
    logger.info('Teste de conexão com banco realizado com sucesso');
    return true;
  } catch (error) {
    logger.error('Teste de conexão com banco falhou:', error);
    return false;
  }
};

export default pool;