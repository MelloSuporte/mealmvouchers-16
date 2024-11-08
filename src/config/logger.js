const logger = {
  info: (message, ...args) => {
    if (import.meta.env.DEV) {
      console.log(`[INFO] ${message}`, ...args);
    }
  },
  
  error: (message, ...args) => {
    if (import.meta.env.DEV) {
      console.error(`[ERROR] ${message}`, ...args);
    }
  },
  
  warn: (message, ...args) => {
    if (import.meta.env.DEV) {
      console.warn(`[WARN] ${message}`, ...args);
    }
  }
};

export default logger;