import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { configureExpress } from './src/config/express.js';
import { startServer } from './src/config/server.js';
import createApp from './src/config/app.js';

/**
 * IMPORTANT: DO NOT MODIFY EXISTING FUNCTIONALITY
 * The following features are working correctly and should not be changed:
 * 1. Company Registration (Cadastro de empresas)
 * 2. User Registration (Cadastro de usuários)
 * 3. Meal Registration (Cadastro de refeições)
 * 
 * Any modifications to other parts of the system should be done with extreme
 * caution to avoid affecting these stable functionalities.
 * 
 * To protect these features during maintenance:
 * 1. Set MAINTENANCE_MODE=true in .env file
 * 2. This will block modifications to protected features
 * 3. Reading operations will still work normally
 */

dotenv.config();

// Verifica modo de manutenção
if (process.env.MAINTENANCE_MODE === 'true') {
  console.warn('⚠️ SISTEMA EM MODO DE MANUTENÇÃO ⚠️');
  console.warn('Modificações em funcionalidades protegidas estão bloqueadas');
}

const app = createApp();
configureExpress(app);
startServer(app);