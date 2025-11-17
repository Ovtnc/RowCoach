import express from 'express';
import {
  createSession,
  joinSession,
  updateWorkoutType,
  startSession,
  updateParticipantStats,
  getSession,
  finishSession,
} from '../controllers/multiRowController';
// import { protect } from '../middleware/auth';

const router = express.Router();

// NOTE: Authentication disabled for demo purposes
// router.use(protect);

// Create new session
router.post('/create', createSession);

// Join session with code
router.post('/join', joinSession);

// Update workout type (host only)
router.put('/workout-type', updateWorkoutType);

// Start session (host only)
router.post('/start', startSession);

// Update participant stats
router.put('/stats', updateParticipantStats);

// Get session by code
router.get('/:code', getSession);

// Finish session
router.post('/finish', finishSession);

export default router;

