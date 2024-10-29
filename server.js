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

// Rota para validar voucher com regras de limite
app.post('/api/vouchers/validate', async (req, res) => {
  const { cpf, voucherCode, mealType } = req.body;
  const today = new Date().toISOString().split('T')[0];

  try {
    // Buscar usuário
    const [users] = await req.db.execute(
      'SELECT * FROM users WHERE cpf = ? AND voucher = ?', 
      [cpf, voucherCode]
    );
    
    if (users.length === 0) {
      return res.status(401).json({ error: 'Voucher inválido' });
    }

    const user = users[0];

    // Verificar se usuário está suspenso
    if (user.is_suspended) {
      return res.status(403).json({ error: 'Usuário suspenso' });
    }

    // Verificar se é voucher extra
    const [extraVouchers] = await req.db.execute(
      'SELECT * FROM extra_vouchers WHERE user_id = ? AND valid_until >= ?',
      [user.id, today]
    );

    if (extraVouchers.length > 0) {
      return res.json({ isExtraVoucher: true });
    }

    // Verificar limites para Turno Central
    if (user.turno === 'central') {
      // Buscar uso de vouchers do dia
      const [usedVouchers] = await req.db.execute(
        `SELECT mt.name as meal_type 
         FROM voucher_usage vu 
         JOIN meal_types mt ON vu.meal_type_id = mt.id 
         WHERE vu.user_id = ? 
         AND DATE(vu.used_at) = ?`,
        [user.id, today]
      );

      // Verificar regras específicas do Turno Central
      const hasUsedLunch = usedVouchers.some(v => v.meal_type === 'Almoço');
      const hasUsedBreakfast = usedVouchers.some(v => v.meal_type === 'Café');
      const hasUsedSnack = usedVouchers.some(v => v.meal_type === 'Lanche');
      const totalMeals = usedVouchers.length;

      // Verificar limites
      if (totalMeals >= 2) {
        return res.status(403).json({ 
          error: 'Limite diário de refeições atingido' 
        });
      }

      if (mealType === 'Almoço' && hasUsedLunch) {
        return res.status(403).json({ 
          error: 'Você já utilizou o almoço hoje' 
        });
      }

      if ((mealType === 'Café' && hasUsedBreakfast) || 
          (mealType === 'Lanche' && hasUsedSnack)) {
        return res.status(403).json({ 
          error: 'Você já utilizou café/lanche hoje' 
        });
      }

      if (!hasUsedLunch && mealType !== 'Almoço' && totalMeals === 1) {
        return res.status(403).json({ 
          error: 'Você deve utilizar o almoço como uma das refeições' 
        });
      }
    }

    res.json({ isExtraVoucher: false });
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

// Iniciar servidor
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
