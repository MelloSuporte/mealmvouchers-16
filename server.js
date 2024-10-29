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

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something broke!' });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// API endpoints
app.get('/api/meal-types', async (req, res, next) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM tipos_refeicao ORDER BY nome');
    res.json(rows);
  } catch (error) {
    next(error);
  }
});

app.post('/api/vouchers/disposable/generate', async (req, res, next) => {
  try {
    const { quantity, mealTypes, dates } = req.body;
    let generatedCount = 0;

    for (const date of dates) {
      for (const mealTypeId of mealTypes) {
        for (let i = 0; i < quantity; i++) {
          const code = Math.random().toString(36).substring(2, 10).toUpperCase();
          await pool.execute(
            'INSERT INTO vouchers_descartaveis (codigo, tipo_refeicao_id, expira_em, criado_por) VALUES (?, ?, ?, ?)',
            [code, mealTypeId, date, 1]
          );
          generatedCount++;
        }
      }
    }

    res.json({ count: generatedCount });
  } catch (error) {
    next(error);
  }
});

app.get('/api/users/search', async (req, res, next) => {
  try {
    const { cpf } = req.query;
    const [rows] = await pool.execute('SELECT * FROM usuarios WHERE cpf = ?', [cpf]);
    res.json(rows[0] || null);
  } catch (error) {
    next(error);
  }
});

app.post('/api/users', async (req, res, next) => {
  try {
    const { nome, email, cpf, empresa_id, voucher, turno, suspenso } = req.body;
    const [result] = await pool.execute(
      'INSERT INTO usuarios (nome, email, cpf, empresa_id, voucher, turno, suspenso) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [nome, email, cpf, empresa_id, voucher, turno, suspenso]
    );
    res.json({ id: result.insertId });
  } catch (error) {
    next(error);
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});