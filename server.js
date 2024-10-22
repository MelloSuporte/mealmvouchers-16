const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Configuração da conexão com o MySQL
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

connection.connect((err) => {
  if (err) {
    console.error('Erro ao conectar ao banco de dados:', err);
    return;
  }
  console.log('Conectado ao banco de dados MySQL');
});

// Rotas para usuários
app.post('/api/users', (req, res) => {
  const { name, email, cpf, company, voucher, turno, isSuspended } = req.body;
  const query = 'INSERT INTO users (name, email, cpf, company, voucher, turno, is_suspended) VALUES (?, ?, ?, ?, ?, ?, ?)';
  connection.query(query, [name, email, cpf, company, voucher, turno, isSuspended], (err, result) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.status(201).json({ id: result.insertId, name, email, cpf, company, voucher, turno, isSuspended });
  });
});

app.get('/api/users', (req, res) => {
  connection.query('SELECT * FROM users', (err, results) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(results);
  });
});

// Rotas para refeições
app.post('/api/meals', (req, res) => {
  const { name, description, startTime, endTime } = req.body;
  const query = 'INSERT INTO meals (name, description, start_time, end_time) VALUES (?, ?, ?, ?)';
  connection.query(query, [name, description, startTime, endTime], (err, result) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.status(201).json({ id: result.insertId, name, description, startTime, endTime });
  });
});

app.get('/api/meals', (req, res) => {
  connection.query('SELECT * FROM meals', (err, results) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(results);
  });
});

// Rotas para vouchers
app.post('/api/vouchers', (req, res) => {
  const { code, userId, mealId, mealType, date, status } = req.body;
  const query = 'INSERT INTO vouchers (code, user_id, meal_id, meal_type, date, status) VALUES (?, ?, ?, ?, ?, ?)';
  connection.query(query, [code, userId, mealId, mealType, date, status], (err, result) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.status(201).json({ id: result.insertId, code, userId, mealId, mealType, date, status });
  });
});

app.get('/api/vouchers', (req, res) => {
  connection.query('SELECT * FROM vouchers', (err, results) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(results);
  });
});

// ... keep existing code (outras rotas e configurações)

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
