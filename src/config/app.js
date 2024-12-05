import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import routes from '../routes/index.js';

const createApp = () => {
  const app = express();

  // Middlewares
  app.use(cors());
  app.use(helmet());
  app.use(compression());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Adiciona um middleware para logging de requisições
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });

  // Mount routes - usando /api como prefixo
  app.use('/api', routes);

  // Error handling
  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  });

  return app;
};

export default createApp;