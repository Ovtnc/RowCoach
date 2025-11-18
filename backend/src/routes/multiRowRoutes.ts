import express from 'express';
import {
  createSession,
  joinSession,
  updateWorkoutType,
  updateIntervalPlan,
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

// Update interval plan (host only)
router.put('/interval-plan', updateIntervalPlan);

// Start session (host only)
router.post('/start', startSession);

// Update participant stats
router.put('/stats', updateParticipantStats);

// Finish session
router.post('/finish', finishSession);

// Get session by code (must be last to avoid matching other routes)
router.get('/:code', getSession);

export default router;

