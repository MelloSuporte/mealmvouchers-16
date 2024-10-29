const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Create MySQL connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test database connection
app.get('/api/test', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    connection.release();
    res.json({ message: 'Database connection successful!' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API endpoints for meal types
app.get('/api/meal-types', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM tipos_refeicao ORDER BY nome');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/meal-types', async (req, res) => {
  try {
    const { nome, hora_inicio, hora_fim, valor, max_usuarios_por_dia, tolerancia_minutos } = req.body;
    const [result] = await pool.execute(
      'INSERT INTO tipos_refeicao (nome, hora_inicio, hora_fim, valor, max_usuarios_por_dia, tolerancia_minutos) VALUES (?, ?, ?, ?, ?, ?)',
      [nome, hora_inicio, hora_fim, valor, max_usuarios_por_dia, tolerancia_minutos]
    );
    res.json({ id: result.insertId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API endpoints for users
app.get('/api/users', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM usuarios ORDER BY nome');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/users', async (req, res) => {
  try {
    const { nome, email, cpf, empresa_id, voucher, turno } = req.body;
    const [result] = await pool.execute(
      'INSERT INTO usuarios (nome, email, cpf, empresa_id, voucher, turno) VALUES (?, ?, ?, ?, ?, ?)',
      [nome, email, cpf, empresa_id, voucher, turno]
    );
    res.json({ id: result.insertId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API endpoints for companies
app.get('/api/companies', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM empresas ORDER BY nome');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/companies', async (req, res) => {
  try {
    const { nome, cnpj, logo } = req.body;
    const [result] = await pool.execute(
      'INSERT INTO empresas (nome, cnpj, logo) VALUES (?, ?, ?)',
      [nome, cnpj, logo]
    );
    res.json({ id: result.insertId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API endpoints for voucher usage
app.get('/api/voucher-usage', async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT uv.*, u.nome as usuario_nome, tr.nome as refeicao_nome 
      FROM uso_voucher uv 
      JOIN usuarios u ON uv.usuario_id = u.id 
      JOIN tipos_refeicao tr ON uv.tipo_refeicao_id = tr.id 
      ORDER BY uv.usado_em DESC
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/voucher-usage', async (req, res) => {
  try {
    const { usuario_id, tipo_refeicao_id } = req.body;
    const [result] = await pool.execute(
      'INSERT INTO uso_voucher (usuario_id, tipo_refeicao_id) VALUES (?, ?)',
      [usuario_id, tipo_refeicao_id]
    );
    res.json({ id: result.insertId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});