import voucherRoutes from './vouchers.js';
import reportRoutes from './reports.js';
import healthRoutes from './health.js';
import mealsRoutes from './meals.js';
import companiesRoutes from './companies.js';

export const configureRoutes = (app) => {
  app.use('/api/vouchers', voucherRoutes);
  app.use('/api/reports', reportRoutes);
  app.use('/api/health', healthRoutes);
  app.use('/api/meals', mealsRoutes);
  app.use('/api/companies', companiesRoutes);
};