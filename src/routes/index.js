import express from 'express';
import vouchersExtraRouter from './vouchersExtra.js';
import someOtherRouter from './someOtherRoute.js'; // Example for other routes, replace with actual imports

const router = express.Router();

// Define all API routes
router.use('/vouchers-extras', vouchersExtraRouter);
router.use('/some-other-route', someOtherRouter); // Example for another route

export default router;
