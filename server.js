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
  const { name, email, cpf, turno } = req.body;
  connection.query(
    'INSERT INTO users (name, email, cpf, turno) VALUES (?, ?, ?, ?)',
    [name, email, cpf, turno],
    (err, result) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.status(201).json({ id: result.insertId, name, email, cpf, turno });
    }
  );
});

// Rota para verificar disponibilidade de voucher
app.post('/api/check-voucher', (req, res) => {
  const { userId, mealType } = req.body;
  
  connection.query(
    'SELECT turno, voucher_count FROM users WHERE id = ?',
    [userId],
    (err, results) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      
      if (results.length === 0) {
        res.status(404).json({ error: 'Usuário não encontrado' });
        return;
      }
      
      const { turno, voucher_count } = results[0];
      
      if (voucher_count <= 0) {
        res.status(403).json({ error: 'Limite de vouchers atingido' });
        return;
      }
      
      let isAllowed = false;
      
      switch (turno) {
        case 'primeiro':
          isAllowed = ['Café (1)', 'Café (2)', 'Almoço'].includes(mealType);
          break;
        case 'segundo':
          isAllowed = ['Jantar', 'Lanche'].includes(mealType);
          break;
        case 'terceiro':
          isAllowed = ['Ceia', 'Desjejum'].includes(mealType);
          break;
      }
      
      if (mealType === 'Extra') {
        // Implementar lógica RLS aqui
        isAllowed = true; // Temporariamente permitindo todas as refeições extras
      }
      
      if (isAllowed) {
        res.json({ allowed: true });
      } else {
        res.status(403).json({ error: 'Refeição não permitida para este turno' });
      }
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

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});