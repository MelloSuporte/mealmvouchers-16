import mysql from 'mysql2/promise';
import logger from './logger';

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'sis_voucher',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  timezone: '-03:00',
  charset: 'utf8mb4'
});

pool.on('connection', function (connection) {
  connection.query('SET time_zone="-03:00"');
});

pool.on('error', (err) => {
  logger.error('Database pool error:', err);
});

export default pool;