import express from 'express';
import { getMeals, createMeal, updateMealStatus } from '../controllers/mealsController.js';

const router = express.Router();

router.get('/', getMeals);
router.post('/', createMeal);
router.patch('/:id', updateMealStatus);

export default router;