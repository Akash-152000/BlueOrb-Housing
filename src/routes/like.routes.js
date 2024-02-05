import {Router} from 'express'
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { getLikedProperties, togglePropertyLike } from '../controllers/like.controller.js';

const router = Router()

router.route('/toggle/p/:propertyId').post(verifyJWT, togglePropertyLike)
router.route('/toggle/p/get-liked-properties').get(verifyJWT, getLikedProperties)

export default router;


