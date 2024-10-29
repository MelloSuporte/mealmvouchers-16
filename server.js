import express from 'express';
import cors from 'cors';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

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

// Rota simples para verificar se o servidor está rodando
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
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
      res.status(404).json({ message: 'Usuário não encontrado' });
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
    const [users] = await req.db.execute(
      'SELECT * FROM users WHERE cpf = ? AND voucher = ?', 
      [cpf, voucherCode]
    );
    
    if (users.length === 0) {
      return res.status(401).json({ error: 'Voucher inválido' });
    }

    const user = users[0];
    if (user.is_suspended) {
      return res.status(403).json({ error: 'Usuário suspenso' });
    }

    const [mealTypes] = await req.db.execute(
      'SELECT * FROM meal_types WHERE name = ?', 
      [mealType]
    );
    
    if (mealTypes.length === 0) {
      return res.status(400).json({ error: 'Tipo de refeição inválido' });
    }

    await req.db.execute(
      'INSERT INTO voucher_usage (user_id, meal_type_id) VALUES (?, ?)',
      [user.id, mealTypes[0].id]
    );

    res.json({ success: true, message: 'Voucher validado com sucesso' });
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

// Rota para validar voucher descartável
app.post('/api/vouchers/validate-disposable', async (req, res) => {
  const { code, mealType } = req.body;
  try {
    const [vouchers] = await req.db.execute(
      `SELECT dv.*, mt.name as meal_type_name 
       FROM disposable_vouchers dv 
       JOIN meal_types mt ON dv.meal_type_id = mt.id 
       WHERE dv.code = ? AND dv.is_used = FALSE 
       AND (dv.expired_at IS NULL OR dv.expired_at > NOW())`,
      [code]
    );

    if (vouchers.length === 0) {
      return res.status(401).json({ error: 'Voucher inválido ou expirado' });
    }

    const voucher = vouchers[0];
    
    if (voucher.meal_type_name !== mealType) {
      return res.status(400).json({ error: 'Tipo de refeição inválido para este voucher' });
    }

    // Marcar voucher como usado
    await req.db.execute(
      'UPDATE disposable_vouchers SET is_used = TRUE, used_at = NOW() WHERE id = ?',
      [voucher.id]
    );

    res.json({ success: true, message: 'Voucher validado com sucesso' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    req.db.release();
  }
});

// Rota para obter tipos de refeição ativos
app.get('/api/meal-types', async (req, res) => {
  try {
    const [rows] = await req.db.execute(
      'SELECT id, name FROM meal_types WHERE is_active = TRUE'
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    req.db.release();
  }
});

// Iniciar servidor
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
