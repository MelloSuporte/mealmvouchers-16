import express from 'express';
import { getMeals, createMeal, updateMealStatus } from '../controllers/mealsController.js';

const router = express.Router();

router.get('/', getMeals);
router.post('/', createMeal);
router.patch('/:id', updateMealStatus);
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  let connection;
  
  try {
    connection = await req.db.getConnection();
    await connection.execute('DELETE FROM meal_types WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    if (connection) connection.release();
  }
});

export default router;