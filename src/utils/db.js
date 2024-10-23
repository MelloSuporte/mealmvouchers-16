import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'Mysql*custos',
  database: 'bd_voucher',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export const executeQuery = async (query, params = []) => {
  try {
    const [rows] = await pool.execute(query, params);
    return rows;
  } catch (error) {
    console.error('Database error:', error);
    throw error;
  }
};