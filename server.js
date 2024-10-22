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

// Nova rota para validar o uso de voucher
app.post('/api/validate-voucher', (req, res) => {
  const { userId, mealType, turno } = req.body;
  const today = new Date().toISOString().split('T')[0];

  // Função para verificar o uso de vouchers no dia
  const checkVoucherUsage = (callback) => {
    connection.query(
      'SELECT COUNT(*) as count FROM vouchers WHERE user_id = ? AND date = ? AND status = "used"',
      [userId, today],
      (err, results) => {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        callback(results[0].count);
      }
    );
  };

  // Função para verificar se o usuário já usou um tipo específico de refeição
  const checkMealTypeUsage = (mealType, callback) => {
    connection.query(
      'SELECT COUNT(*) as count FROM vouchers WHERE user_id = ? AND date = ? AND meal_type = ? AND status = "used"',
      [userId, today, mealType],
      (err, results) => {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        callback(results[0].count > 0);
      }
    );
  };

  // Validar regras baseadas no turno
  checkVoucherUsage((voucherCount) => {
    if (voucherCount >= 2 && mealType !== 'Extra') {
      res.status(403).json({ error: 'Limite diário de vouchers atingido' });
      return;
    }

    if (mealType === 'Extra') {
      // Verificar regras RLS (não implementadas neste exemplo)
      res.json({ valid: true, message: 'Voucher Extra válido, sujeito às regras RLS' });
      return;
    }

    switch (turno) {
      case 'central':
        if (mealType === 'Café (2)' || mealType === 'Almoço') {
          checkMealTypeUsage('Lanche', (usedLanche) => {
            if (usedLanche) {
              res.status(403).json({ error: 'Usuário já utilizou Lanche, não pode usar Café (2)' });
            } else {
              res.json({ valid: true });
            }
          });
        } else {
          res.status(403).json({ error: 'Tipo de refeição não permitido para este turno' });
        }
        break;
      case 'primeiro':
        if (mealType === 'Café (1)' || mealType === 'Almoço') {
          checkMealTypeUsage('Café (2)', (usedCafe2) => {
            if (usedCafe2) {
              res.status(403).json({ error: 'Usuário já utilizou Café (2), não pode usar Café (1)' });
            } else {
              res.json({ valid: true });
            }
          });
        } else {
          res.status(403).json({ error: 'Tipo de refeição não permitido para este turno' });
        }
        break;
      case 'segundo':
        if (mealType === 'Jantar' || mealType === 'Lanche') {
          res.json({ valid: true });
        } else {
          res.status(403).json({ error: 'Tipo de refeição não permitido para este turno' });
        }
        break;
      case 'terceiro':
        if (mealType === 'Ceia' || mealType === 'Desjejum') {
          res.json({ valid: true });
        } else {
          res.status(403).json({ error: 'Tipo de refeição não permitido para este turno' });
        }
        break;
      default:
        res.status(400).json({ error: 'Turno inválido' });
    }
  });
});

// ... keep existing code (outras rotas e configurações)

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
