import {Router} from 'express'
import { verifyAuthority, verifyJWT } from '../middlewares/auth.middleware.js';
import { getNotifications, markNotificationAsRead } from '../controllers/notification.controller.js';

const router = Router()

router.route('/get-notifications').get(verifyJWT, verifyAuthority, getNotifications)
router.route('/mark-notifications').get(verifyJWT, verifyAuthority, markNotificationAsRead)

export default router;