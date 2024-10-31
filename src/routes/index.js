import voucherRoutes from './vouchers.js';
import reportRoutes from './reports.js';
import healthRoutes from './health.js';
import mealsRoutes from './meals.js';
import companiesRoutes from './companies.js';
import usersRoutes from './users.js';
import extraVouchersRoutes from './extraVouchers.js';

export const configureRoutes = (app) => {
  // Health check route
  app.use('/health', healthRoutes);
  
  // API routes with /api prefix
  const apiRouter = express.Router();
  
  apiRouter.use('/vouchers', voucherRoutes);
  apiRouter.use('/reports', reportRoutes);
  apiRouter.use('/meals', mealsRoutes);
  apiRouter.use('/companies', companiesRoutes);
  apiRouter.use('/users', usersRoutes);
  apiRouter.use('/extra-vouchers', extraVouchersRoutes);
  
  // Mount all API routes under /api
  app.use('/api', apiRouter);
};