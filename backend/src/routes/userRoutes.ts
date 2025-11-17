import { Router } from 'express';
import { createUser } from '../controllers/userController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Protected route - require authentication
router.post('/', authenticate, createUser);

export default router;

