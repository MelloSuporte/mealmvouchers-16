import express from 'express';
import { supabase } from '../config/supabase.js';
import logger from '../config/logger.js';

const router = express.Router();

// Get all shift configurations
router.get('/', async (req, res) => {
  try {
    const { data: shifts, error } = await supabase
      .from('shift_configurations')
      .select('*')
      .order('id');

    if (error) {
      logger.error('Error fetching shift configurations:', error);
      return res.status(500).json({ 
        error: 'Database error',
        message: 'Failed to fetch shift configurations'
      });
    }
    
    res.json(shifts);
  } catch (error) {
    logger.error('Error in shift configurations route:', error);
    res.status(500).json({ 
      error: 'Server error',
      message: 'An unexpected error occurred'
    });
  }
});

// Create new shift configuration
router.post('/', async (req, res) => {
  const { shift_type, start_time, end_time, is_active } = req.body;
  
  try {
    const { data: shift, error } = await supabase
      .from('shift_configurations')
      .insert([{
        shift_type,
        start_time,
        end_time,
        is_active,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) {
      logger.error('Error creating shift configuration:', error);
      return res.status(400).json({ 
        error: 'Database error',
        message: 'Failed to create shift configuration'
      });
    }
    
    res.status(201).json(shift);
  } catch (error) {
    logger.error('Error in create shift configuration route:', error);
    res.status(500).json({ 
      error: 'Server error',
      message: 'An unexpected error occurred'
    });
  }
});

// Update shift configuration
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { start_time, end_time, is_active } = req.body;
  
  try {
    const { data: shift, error } = await supabase
      .from('shift_configurations')
      .update({
        start_time,
        end_time,
        is_active,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      logger.error('Error updating shift configuration:', error);
      return res.status(400).json({ 
        error: 'Database error',
        message: 'Failed to update shift configuration'
      });
    }
    
    if (!shift) {
      return res.status(404).json({ error: 'Shift configuration not found' });
    }
    
    res.json(shift);
  } catch (error) {
    logger.error('Error in update shift configuration route:', error);
    res.status(500).json({ 
      error: 'Server error',
      message: 'An unexpected error occurred'
    });
  }
});

export default router;