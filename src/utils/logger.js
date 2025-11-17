/**
 * 📝 Logger Customizado
 * 
 * Substitui console.log para controlar logs em produção.
 * Logs só aparecem em desenvolvimento, mantendo o console limpo em produção.
 */

const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';

/**
 * Formata data/hora para logs
 */
const getTimestamp = () => {
  return new Date().toLocaleString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    fractionalSecondDigits: 3
  });
};

/**
 * Logger customizado com diferentes níveis
 */
export const logger = {
  /**
   * Log informativo (apenas em desenvolvimento)
   */
  log: (...args) => {
    if (isDevelopment) {
      console.log(`[${getTimestamp()}]`, ...args);
    }
  },

  /**
   * Log de informação importante (sempre exibido)
   */
  info: (...args) => {
    console.info(`[${getTimestamp()}] ℹ️`, ...args);
  },

  /**
   * Log de aviso (sempre exibido)
   */
  warn: (...args) => {
    console.warn(`[${getTimestamp()}] ⚠️`, ...args);
  },

  /**
   * Log de erro (sempre exibido)
   */
  error: (...args) => {
    console.error(`[${getTimestamp()}] ❌`, ...args);
  },

  /**
   * Log de sucesso (apenas em desenvolvimento)
   */
  success: (...args) => {
    if (isDevelopment) {
      console.log(`[${getTimestamp()}] ✅`, ...args);
    }
  },

  /**
   * Log de debug (apenas em desenvolvimento)
   */
  debug: (...args) => {
    if (isDevelopment) {
      console.log(`[${getTimestamp()}] 🐛`, ...args);
    }
  },

  /**
   * Log estruturado para eventos importantes
   */
  event: (eventName, data = {}) => {
    if (isDevelopment) {
      console.log(`[${getTimestamp()}] 📊 EVENT: ${eventName}`, data);
    }
    
    // Em produção, você pode enviar para analytics aqui
    if (isProduction && window.gtag) {
      window.gtag('event', eventName, data);
    }
  },

  /**
   * Agrupa logs relacionados (apenas em desenvolvimento)
   */
  group: (label, callback) => {
    if (isDevelopment) {
      console.group(`[${getTimestamp()}] ${label}`);
      callback();
      console.groupEnd();
    } else {
      callback();
    }
  },

  /**
   * Log de performance (apenas em desenvolvimento)
   */
  time: (label) => {
    if (isDevelopment) {
      console.time(`⏱️ ${label}`);
    }
  },

  timeEnd: (label) => {
    if (isDevelopment) {
      console.timeEnd(`⏱️ ${label}`);
    }
  },

  /**
   * Log de tabela (apenas em desenvolvimento)
   */
  table: (data) => {
    if (isDevelopment) {
      console.table(data);
    }
  }
};

/**
 * Helpers para logs contextualizados
 */
export const loggers = {
  auth: {
    login: (user) => logger.event('login', { userId: user?.uid, email: user?.email }),
    logout: () => logger.event('logout'),
    error: (error) => logger.error('Auth error:', error)
  },

  api: {
    request: (endpoint, method = 'GET') => {
      logger.debug(`API ${method}:`, endpoint);
    },
    success: (endpoint, data) => {
      logger.success(`API Success:`, endpoint, data);
    },
    error: (endpoint, error) => {
      logger.error(`API Error:`, endpoint, error);
    }
  },

  firestore: {
    read: (collection, id) => {
      logger.debug(`Firestore READ: ${collection}/${id || 'all'}`);
    },
    write: (collection, id, data) => {
      logger.debug(`Firestore WRITE: ${collection}/${id}`, data);
    },
    delete: (collection, id) => {
      logger.debug(`Firestore DELETE: ${collection}/${id}`);
    },
    error: (operation, error) => {
      logger.error(`Firestore ${operation} error:`, error);
    }
  },

  ui: {
    render: (component) => {
      logger.debug(`Rendering: ${component}`);
    },
    interaction: (action, target) => {
      logger.event(action, { target });
    }
  }
};

/**
 * Exporta como default também
 */
export default logger;

