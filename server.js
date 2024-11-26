import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { configureExpress } from './src/config/express.js';
import { startServer } from './src/config/server.js';
import createApp from './src/config/app.js';
import vouchersExtraRouter from './src/routes/vouchersExtra.js';

/**
 * SISTEMA DE VOUCHERS - DOCUMENTAÇÃO DE FUNCIONALIDADES ESTÁVEIS
 * 
 * FUNCIONALIDADES PROTEGIDAS (NÃO MODIFICAR):
 * 1. Cadastro de Empresas
 *    - Arquivo: src/components/admin/CompanyForm.jsx
 *    - Status: ESTÁVEL
 * 
 * 2. Cadastro de Usuários
 *    - Arquivo: src/components/admin/UserForm.jsx
 *    - Status: ESTÁVEL
 * 
 * 3. Cadastro de Refeições
 *    - Arquivo: src/components/admin/meals/MealScheduleForm.jsx
 *    - Status: ESTÁVEL
 * 
 * MODO DE MANUTENÇÃO:
 * Para proteger estas funcionalidades durante manutenção:
 * 1. Defina MAINTENANCE_MODE=true no arquivo .env
 * 2. Isso bloqueará modificações nas funcionalidades protegidas
 * 3. Operações de leitura continuarão funcionando normalmente
 */

dotenv.config();

// Verifica modo de manutenção
if (process.env.MAINTENANCE_MODE === 'true') {
  console.warn('⚠️ SISTEMA EM MODO DE MANUTENÇÃO ⚠️');
  console.warn('Modificações em funcionalidades protegidas estão bloqueadas');
}

const app = createApp();

// Configura CORS
app.use(cors());

// Configura body parser
app.use(express.json());

// Adiciona log para debug da rota
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Configura as rotas da aplicação
configureExpress(app);

// Inicia o servidor
startServer(app);