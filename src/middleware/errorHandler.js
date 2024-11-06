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

  // Erros de conexão com banco de dados
  if (err.code === 'ECONNREFUSED' || err.code === 'PROTOCOL_CONNECTION_LOST') {
    return res.status(503).json({
      error: 'Erro de conexão com o banco de dados',
      message: 'O sistema está temporariamente indisponível. Tentando reconectar automaticamente...'
    });
  }

  // Erros de timeout
  if (err.code === 'ETIMEDOUT' || err.code === 'ESOCKETTIMEDOUT') {
    return res.status(504).json({
      error: 'Tempo limite excedido',
      message: 'A operação demorou muito para responder. Por favor, tente novamente.'
    });
  }

  // Erros de consulta SQL
  if (err.code === 'ER_PARSE_ERROR' || err.code === 'ER_BAD_FIELD_ERROR') {
    return res.status(400).json({
      error: 'Erro na consulta ao banco de dados',
      message: 'Dados inválidos ou mal formatados'
    });
  }

  // Erros de validação
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Erro de validação',
      message: err.message,
      details: err.details
    });
  }

  // Erros de autenticação
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      error: 'Erro de autenticação',
      message: 'Sessão expirada ou inválida'
    });
  }

  // Resposta padrão para outros erros
  res.status(err.status || 500).json({
    error: 'Erro interno do servidor',
    message: process.env.NODE_ENV === 'development' 
      ? err.message 
      : 'Ocorreu um erro ao processar sua requisição. Por favor, tente novamente.'
  });
};