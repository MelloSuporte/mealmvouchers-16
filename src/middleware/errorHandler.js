import logger from '../config/logger.js';

export const errorHandler = (err, req, res, next) => {
  logger.error('Error details:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    query: req.query,
    body: req.body,
    timestamp: new Date().toISOString()
  });

  // Database connection errors
  if (err.code === 'ECONNREFUSED') {
    return res.status(503).json({
      error: 'Erro de conexão com o banco de dados',
      message: 'Por favor, tente novamente em alguns instantes'
    });
  }

  // Query/SQL errors
  if (err.code === 'ER_PARSE_ERROR' || err.code === 'ER_BAD_FIELD_ERROR') {
    return res.status(400).json({
      error: 'Erro na consulta ao banco de dados',
      message: 'Dados inválidos ou mal formatados'
    });
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Erro de validação',
      message: err.message,
      details: err.details
    });
  }

  // Authentication errors
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      error: 'Erro de autenticação',
      message: 'Sessão expirada ou inválida'
    });
  }

  // Default error response
  res.status(err.status || 500).json({
    error: 'Erro interno do servidor',
    message: process.env.NODE_ENV === 'development' 
      ? err.message 
      : 'Ocorreu um erro ao processar sua requisição. Por favor, tente novamente.'
  });
};