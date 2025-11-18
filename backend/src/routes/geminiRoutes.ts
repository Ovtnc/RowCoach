import { Router } from 'express';
import { generateText } from '../controllers/geminiController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);
router.post('/generate', generateText);

export default router;


