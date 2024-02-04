import {Router} from 'express'
import { verifyAuthority, verifyJWT } from '../middlewares/auth.middleware.js'
import { createProperty, healthCheck } from '../controllers/property.controller.js'
import { upload } from "../middlewares/multer.middleware.js";

const router = Router()

router.route('/create-property').post(verifyJWT,verifyAuthority, upload.fields([
    {
        name:'images',
        maxCount:15
    },
    {
        name:'videos',
        maxCount:10
    }
]), createProperty)



export default router;