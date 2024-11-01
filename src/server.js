import createApp from './config/app.js';
import logger from './config/logger.js';
import { startServer } from './config/server.js';

const app = createApp();
startServer(app);