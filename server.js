const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Criar pool de conexões MySQL
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Middleware para verificar conexão com banco
app.use(async (req, res, next) => {
  try {
    req.db = await pool.getConnection();
    next();
  } catch (err) {
    console.error('Database connection error:', err);
    res.status(500).json({ error: 'Error connecting to database' });
  }
});

// Rota de teste
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'API is running' });
});

// Rotas para usuários
app.post('/api/users', async (req, res) => {
  const { name, email, cpf, company, voucher, turno, isSuspended } = req.body;
  try {
    const [result] = await req.db.execute(
      'INSERT INTO users (name, email, cpf, company, voucher, turno, is_suspended) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, email, cpf, company, voucher, turno, isSuspended]
    );
    res.status(201).json({ id: result.insertId, ...req.body });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: error.message });
  } finally {
    req.db.release();
  }
});

app.get('/api/users', async (req, res) => {
  try {
    const [rows] = await req.db.execute('SELECT * FROM users');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: error.message });
  } finally {
    req.db.release();
  }
});

app.get('/api/users/search', async (req, res) => {
  const { cpf } = req.query;
  try {
    const [rows] = await req.db.execute('SELECT * FROM users WHERE cpf = ?', [cpf]);
    if (rows.length > 0) {
      res.json(rows[0]);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Error searching user:', error);
    res.status(500).json({ error: error.message });
  } finally {
    req.db.release();
  }
});

// Tratamento de erros global
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something broke!' });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});