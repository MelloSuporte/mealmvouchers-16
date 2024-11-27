import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { configureExpress } from './src/config/express.js';
import { startServer } from './src/config/server.js';
import createApp from './src/config/app.js';
import routes from './src/routes/index.js';
import vouchersExtraRouter from './src/routes/vouchersExtra.js';

dotenv.config();

const app = createApp();

// Configura CORS primeiro
app.use(cors());

// Configura body parser
app.use(express.json());

// Adiciona log para debug da rota
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Configura as rotas da aplicação
configureExpress(app);

// Adiciona todas as rotas da API
app.use('/api', routes);
app.use('/api/vouchers-extra', vouchersExtraRouter);

// Inicia o servidor
startServer(app);