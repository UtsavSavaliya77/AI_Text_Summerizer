import { Router } from 'express';
import * as adminController from '../controllers/admin.controller.js';
import { authenticate } from '../middlewears/auth.middleware.js';
import { authorizeAdmin } from '../middlewears/admin.middleware.js';

const router = Router();

// Secure all admin routes
router.use(authenticate, authorizeAdmin);

router.get('/stats', adminController.getSystemStats);
router.get('/users', adminController.getAllUsers);

export default router;