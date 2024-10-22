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
  host: process.env.DB_HOST || 'localhost',
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

// Rota para cadastrar usuário
app.post('/api/users', (req, res) => {
  const { name, email, cpf, company, voucher, turno, isSuspended } = req.body;
  const query = 'INSERT INTO users (name, email, cpf, company, voucher, turno, is_suspended) VALUES (?, ?, ?, ?, ?, ?, ?)';
  connection.query(query, [name, email, cpf, company, voucher, turno, isSuspended], (err, result) => {
    if (err) {
      console.error('Erro ao cadastrar usuário:', err);
      res.status(500).json({ error: err.message });
      return;
    }
    res.status(201).json({ id: result.insertId, name, email, cpf, company, voucher, turno, isSuspended });
  });
});

// Rota para cadastrar empresa
app.post('/api/companies', (req, res) => {
  const { companyName, cnpj, logo } = req.body;
  const query = 'INSERT INTO companies (name, cnpj, logo) VALUES (?, ?, ?)';
  connection.query(query, [companyName, cnpj, logo], (err, result) => {
    if (err) {
      console.error('Erro ao cadastrar empresa:', err);
      res.status(500).json({ error: err.message });
      return;
    }
    res.status(201).json({ id: result.insertId, companyName, cnpj, logo });
  });
});

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});