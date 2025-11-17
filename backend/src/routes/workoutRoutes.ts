import express from 'express';
import {
  createWorkout,
  getWorkouts,
  getWorkoutById,
  updateWorkout,
  deleteWorkout,
  getWorkoutStats,
  getPublicWorkouts,
} from '../controllers/workoutController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

router.post('/', authenticate, createWorkout);
router.get('/', authenticate, getWorkouts);
router.get('/public', authenticate, getPublicWorkouts);
router.get('/stats', authenticate, getWorkoutStats);
router.get('/:id', authenticate, getWorkoutById);
router.put('/:id', authenticate, updateWorkout);
router.delete('/:id', authenticate, deleteWorkout);

export default router;







