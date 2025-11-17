import express from 'express';
import {
  createClub,
  getClub,
  joinClub,
  addCoach,
  getPublicClubs,
  getClubWorkouts,
} from '../controllers/clubController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

router.post('/', authenticate, createClub);
router.get('/public', authenticate, getPublicClubs);
router.get('/:id', authenticate, getClub);
router.post('/join', authenticate, joinClub);
router.post('/:id/coaches', authenticate, addCoach);
router.get('/:id/workouts', authenticate, getClubWorkouts);

export default router;







