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
app.get('/api/users', (req, res) => {
  connection.query('SELECT * FROM users', (err, results) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(results);
  });
});

app.post('/api/users', (req, res) => {
  const { name, email } = req.body;
  connection.query(
    'INSERT INTO users (name, email) VALUES (?, ?)',
    [name, email],
    (err, result) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.status(201).json({ id: result.insertId, name, email });
    }
  );
});

// Rotas para refeições
app.get('/api/meals', (req, res) => {
  connection.query('SELECT * FROM meals', (err, results) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(results);
  });
});

// Rotas para itens do menu
app.get('/api/menu-items', (req, res) => {
  connection.query('SELECT * FROM menu_items', (err, results) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(results);
  });
});

// Rotas para reservas
app.get('/api/reservations', (req, res) => {
  connection.query('SELECT * FROM reservations', (err, results) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(results);
  });
});

// Rotas para vouchers
app.get('/api/vouchers', (req, res) => {
  connection.query('SELECT * FROM vouchers', (err, results) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(results);
  });
});

// Nova rota para salvar tipos de refeição
app.post('/api/meal-types', (req, res) => {
  const { mealType, mealValue, startTime, endTime } = req.body;
  const query = 'INSERT INTO meal_types (type, value, start_time, end_time) VALUES (?, ?, ?, ?)';
  connection.query(query, [mealType, mealValue, startTime, endTime], (err, result) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.status(201).json({ id: result.insertId, mealType, mealValue, startTime, endTime });
  });
});

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
