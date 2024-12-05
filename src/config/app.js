import express from 'express';
import { configureExpress } from './express.js';

const createApp = () => {
  const app = express();
  configureExpress(app);
  return app;
};

export default createApp;