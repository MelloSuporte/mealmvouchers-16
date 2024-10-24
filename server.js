const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Middleware para verificar conexão
app.use(async (req, res, next) => {
  try {
    req.db = await pool.getConnection();
    next();
  } catch (err) {
    console.error('Database connection error:', err);
    res.status(500).json({ error: 'Error connecting to database' });
  }
});

// Rotas de usuários
app.post('/api/users', async (req, res) => {
  const { name, email, cpf, company_id, voucher, turno } = req.body;
  try {
    const [result] = await req.db.execute(
      'INSERT INTO users (name, email, cpf, company_id, voucher, turno) VALUES (?, ?, ?, ?, ?, ?)',
      [name, email, cpf, company_id, voucher, turno]
    );
    res.status(201).json({ id: result.insertId, ...req.body });
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    req.db.release();
  }
});

app.get('/api/users/search', async (req, res) => {
  const { cpf } = req.query;
  try {
    const [rows] = await req.db.execute(
      'SELECT u.*, c.name as company_name FROM users u LEFT JOIN companies c ON u.company_id = c.id WHERE u.cpf = ?',
      [cpf]
    );
    if (rows.length > 0) {
      res.json(rows[0]);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    req.db.release();
  }
});

// Rota para validar voucher
app.post('/api/vouchers/validate', async (req, res) => {
  const { cpf, voucherCode, mealType } = req.body;
  try {
    // Verificar usuário
    const [users] = await req.db.execute('SELECT * FROM users WHERE cpf = ? AND voucher = ?', [cpf, voucherCode]);
    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid voucher' });
    }

    const user = users[0];
    if (user.is_suspended) {
      return res.status(403).json({ error: 'User is suspended' });
    }

    // Verificar horário da refeição
    const [mealTypes] = await req.db.execute('SELECT * FROM meal_types WHERE name = ?', [mealType]);
    if (mealTypes.length === 0) {
      return res.status(400).json({ error: 'Invalid meal type' });
    }

    const mealTypeData = mealTypes[0];
    if (mealTypeData.start_time && mealTypeData.end_time) {
      const now = new Date();
      const currentTime = `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;
      if (currentTime < mealTypeData.start_time || currentTime > mealTypeData.end_time) {
        return res.status(403).json({ error: 'Meal not available at this time' });
      }
    }

    // Registrar uso do voucher
    await req.db.execute(
      'INSERT INTO voucher_usage (user_id, meal_type_id) VALUES (?, ?)',
      [user.id, mealTypeData.id]
    );

    res.json({ success: true, message: 'Voucher validated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    req.db.release();
  }
});

// Rotas para empresas
app.post('/api/companies', async (req, res) => {
  const { name, cnpj, logo } = req.body;
  try {
    const [result] = await req.db.execute(
      'INSERT INTO companies (name, cnpj, logo) VALUES (?, ?, ?)',
      [name, cnpj, logo]
    );
    res.status(201).json({ id: result.insertId, ...req.body });
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    req.db.release();
  }
});

// Rotas para imagens de fundo
app.post('/api/background-images', async (req, res) => {
  const { page, imageUrl } = req.body;
  try {
    await req.db.execute('UPDATE background_images SET active = FALSE WHERE page = ?', [page]);
    const [result] = await req.db.execute(
      'INSERT INTO background_images (page, image_url, active) VALUES (?, ?, TRUE)',
      [page, imageUrl]
    );
    res.status(201).json({ id: result.insertId, ...req.body });
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    req.db.release();
  }
});

app.get('/api/background-images/:page', async (req, res) => {
  const { page } = req.params;
  try {
    const [rows] = await req.db.execute(
      'SELECT * FROM background_images WHERE page = ? AND active = TRUE ORDER BY created_at DESC LIMIT 1',
      [page]
    );
    res.json(rows[0] || null);
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    req.db.release();
  }
});

// Iniciar servidor
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});