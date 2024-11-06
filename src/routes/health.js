import express from 'express';
import { testConnection } from '../config/database.js';
import logger from '../config/logger.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    // Testa a conexão com o banco de dados
    const dbConnected = await testConnection();
    
    // Retorna o status do sistema
    res.json({ 
      status: dbConnected ? 'OK' : 'ERROR',
      message: dbConnected ? 'Servidor rodando e banco de dados conectado' : 'Falha na conexão com banco de dados',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      database: {
        host: process.env.DB_HOST,
        name: process.env.DB_NAME,
        connected: dbConnected
      }
    });
  } catch (error) {
    logger.error('Falha no health check:', error);
    res.status(503).json({ 
      status: 'ERROR',
      message: 'Erro ao verificar status do sistema',
      error: error.message 
    });
  }
});

export default router;