import express from 'express';
import { getMeals, createMeal, updateMealStatus } from '../controllers/mealsController.js';

const router = express.Router();

router.get('/meals', getMeals);
router.post('/meals', createMeal);
router.patch('/meals/:id', updateMealStatus);

export default router;