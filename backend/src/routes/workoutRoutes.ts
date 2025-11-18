import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  createWorkout,
  getWorkouts,
  getWorkout,
  updateWorkout,
  deleteWorkout,
} from '../controllers/workoutController';

const router = Router();

router.use(authenticate);

router.post('/', createWorkout);
router.get('/', getWorkouts);
router.get('/:id', getWorkout);
router.put('/:id', updateWorkout);
router.delete('/:id', deleteWorkout);

export default router;
