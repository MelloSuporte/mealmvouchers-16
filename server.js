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
 */

dotenv.config();

const app = createApp();
configureExpress(app);
startServer(app);