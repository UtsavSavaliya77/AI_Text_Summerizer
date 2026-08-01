import { Router } from 'express';
import * as chatController from '../controllers/chat.controller.js';
import { authenticate } from '../middlewears/auth.middleware.js';

const router = Router();

router.use(authenticate);

router.post('/', chatController.sendMessage);
router.get('/:summaryId', chatController.getChatHistory);

export default router;