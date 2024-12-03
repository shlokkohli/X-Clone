import { Router } from 'express'
import { getNotifications, deleteNotifications, deleteOne } from '../controllers/notification.controller.js'
import { authMiddleware } from '../middlewares/authMiddleware.js'

const router = Router();

router.get('/', authMiddleware, getNotifications);
router.delete('/', authMiddleware, deleteNotifications)
router.delete('/:id', authMiddleware, deleteOne);

export default router;