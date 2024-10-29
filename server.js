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

// Helper function to check if time is within shift hours
const isWithinShiftHours = (shift, currentTime) => {
  const timeRanges = {
    'central': { start: '08:00', end: '17:00' },
    'primeiro': { start: '06:00', end: '14:00' },
    'segundo': { start: '14:00', end: '22:00' },
    'terceiro': { start: '22:00', end: '06:00' }
  };
  
  const range = timeRanges[shift];
  const current = currentTime.split(':').map(Number);
  const start = range.start.split(':').map(Number);
  const end = range.end.split(':').map(Number);
  
  if (shift === 'terceiro') {
    // Special handling for third shift that crosses midnight
    return (current[0] >= start[0] || current[0] <= end[0]);
  }
  
  return (current[0] >= start[0] && current[0] < end[0]);
};

// Helper function to get allowed meal types by shift
const getAllowedMealsByShift = (shift) => {
  const mealsByShift = {
    'central': ['Café', 'Almoço', 'Lanche'],
    'primeiro': ['Café', 'Almoço'],
    'segundo': ['Lanche', 'Jantar'],
    'terceiro': ['Café', 'Ceia']
  };
  return mealsByShift[shift] || [];
};

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
  const currentTime = new Date().toLocaleTimeString('pt-BR', { hour12: false }).slice(0, 5);
  
  try {
    // Get user and their shift
    const [users] = await req.db.execute(
      'SELECT * FROM users WHERE cpf = ? AND voucher = ?',
      [cpf, voucherCode]
    );

    if (users.length === 0) {
      return res.status(401).json({ 
        error: 'Voucher inválido',
        userName: null,
        turno: null 
      });
    }

    const user = users[0];
    
    if (user.is_suspended) {
      return res.status(403).json({ 
        error: 'Usuário suspenso',
        userName: user.name,
        turno: user.turno 
      });
    }

    // Check if user is within their shift hours
    if (!isWithinShiftHours(user.turno, currentTime)) {
      return res.status(403).json({
        error: `${user.name}, você está fora do horário do ${user.turno} turno`,
        userName: user.name,
        turno: user.turno
      });
    }

    // Get today's meal usage
    const today = new Date().toISOString().slice(0, 10);
    const [usedMeals] = await req.db.execute(
      `SELECT mt.name 
       FROM voucher_usage vu 
       JOIN meal_types mt ON vu.meal_type_id = mt.id 
       WHERE vu.user_id = ? 
       AND DATE(vu.used_at) = ?`,
      [user.id, today]
    );

    const allowedMeals = getAllowedMealsByShift(user.turno);
    
    // Check if meal type is allowed for user's shift
    if (!allowedMeals.includes(mealType)) {
      return res.status(403).json({
        error: `${mealType} não está disponível para o ${user.turno} turno`,
        userName: user.name,
        turno: user.turno
      });
    }

    // Check daily meal limits and rules
    if (usedMeals.length >= 2) {
      // Check if this is an extra voucher request
      const [extraVoucher] = await req.db.execute(
        'SELECT * FROM extra_vouchers WHERE user_id = ? AND valid_until >= ? AND used = FALSE',
        [user.id, today]
      );

      if (!extraVoucher.length) {
        return res.status(403).json({
          error: 'Limite diário de refeições atingido',
          userName: user.name,
          turno: user.turno
        });
      }
    }

    // Validate meal combination rules
    const usedMealTypes = usedMeals.map(m => m.name);
    if (usedMealTypes.includes(mealType)) {
      return res.status(403).json({
        error: 'Não é permitido repetir o mesmo tipo de refeição',
        userName: user.name,
        turno: user.turno
      });
    }

    // Record the meal usage
    await req.db.execute(
      'INSERT INTO voucher_usage (user_id, meal_type_id) VALUES (?, (SELECT id FROM meal_types WHERE name = ?))',
      [user.id, mealType]
    );

    res.json({ 
      success: true, 
      message: 'Voucher validado com sucesso',
      userName: user.name,
      turno: user.turno
    });
  } catch (error) {
    res.status(500).json({ 
      error: error.message,
      userName: null,
      turno: null
    });
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
  
  if (!/^\d{4}$/.test(code)) {
    return res.status(400).json({ error: 'Código do voucher deve conter 4 dígitos numéricos' });
  }

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
