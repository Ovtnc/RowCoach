import { Router } from 'express';
import {
  getTrainings,
  getCoachTrainings,
  createTraining,
  updateTraining,
  deleteTraining,
  toggleTrainingCompletion,
} from '../controllers/trainingController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Protected route - get all trainings (for mobile app - requires auth for completion status)
router.get('/', authenticate, getTrainings);

// Protected routes - require authentication
router.get('/coach', authenticate, getCoachTrainings);
router.post('/', authenticate, createTraining);
router.put('/:id', authenticate, updateTraining);
router.delete('/:id', authenticate, deleteTraining);

// Toggle training completion
router.post('/:trainingId/complete', authenticate, toggleTrainingCompletion);

export default router;

