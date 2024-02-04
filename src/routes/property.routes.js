import {Router} from 'express'
import { verifyAuthority, verifyJWT } from '../middlewares/auth.middleware.js'
import { createProperty, deleteProperty, getMyProperties, getSingleProperty, healthCheck } from '../controllers/property.controller.js'
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

router.route('/delete-property/:id').delete(verifyJWT, verifyAuthority, deleteProperty)
router.route('/my-properties').get(verifyJWT, verifyAuthority, getMyProperties)

// Routes Accesible to all
router.route('/get-single-property/:id').get(verifyJWT, getSingleProperty)

export default router;