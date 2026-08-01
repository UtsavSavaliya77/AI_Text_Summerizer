import { Router } from 'express';
import * as summaryController from '../controllers/summary.controller.js';
import { authenticate } from '../middlewears/auth.middleware.js';

const router = Router();

router.use(authenticate); // All summary routes require authentication

router.post('/', summaryController.summarize);
router.get('/', summaryController.getSummaries);
router.get('/:id', summaryController.getSummaryById);
router.delete('/:id', summaryController.deleteSummary);

export default router;