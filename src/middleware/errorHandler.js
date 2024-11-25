import logger from '../config/logger.js';

export const errorHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  // Log detalhado do erro
  logger.error('Detalhes do erro:', {
    mensagem: err.message,
    stack: err.stack,
    caminho: req.path,
    metodo: req.method,
    query: req.query,
    body: req.body,
    timestamp: new Date().toISOString()
  });

  // Erros específicos do Supabase
  if (err.code?.startsWith('PGRST')) {
    return res.status(400).json({
      erro: 'Erro na consulta ao banco de dados',
      mensagem: 'Dados inválidos ou mal formatados',
      detalhes: process.env.NODE_ENV === 'development' ? err.message : null
    });
  }

  // Erros de conexão
  if (err.code === 'ECONNREFUSED' || err.code === 'PROTOCOL_CONNECTION_LOST') {
    return res.status(503).json({
      erro: 'Erro de conexão com o banco de dados',
      mensagem: 'O sistema está temporariamente indisponível. Tentando reconectar automaticamente...'
    });
  }

  // Erros de timeout
  if (err.code === 'ETIMEDOUT' || err.code === 'ESOCKETTIMEDOUT') {
    return res.status(504).json({
      erro: 'Tempo limite excedido',
      mensagem: 'A operação demorou muito para responder. Por favor, tente novamente.'
    });
  }

  // Erros de validação
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      erro: 'Erro de validação',
      mensagem: err.message,
      detalhes: err.details
    });
  }

  // Erros de autenticação
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      erro: 'Erro de autenticação',
      mensagem: 'Sessão expirada ou inválida'
    });
  }

  // Resposta padrão para outros erros
  res.status(err.status || 500).json({
    erro: 'Erro interno do servidor',
    mensagem: process.env.NODE_ENV === 'development' 
      ? err.message 
      : 'Ocorreu um erro ao processar sua requisição. Por favor, tente novamente.',
    codigo: err.code || 'UNKNOWN_ERROR'
  });
};