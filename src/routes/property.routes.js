import {Router} from 'express'
import { isOwnerOf, verifyAuthority, verifyJWT } from '../middlewares/auth.middleware.js'
import { createProperty, deleteProperty, deletePropertyImages, deletePropertyVideos, getAllProperties, getMyProperties, getSingleProperty, getTotalViews, getWhoVisitedPropertyPage, healthCheck, updatePropertyImages, updatePropertyVideos, updateproperty } from '../controllers/property.controller.js'
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
router.route('/update-property/:id').patch(verifyJWT, verifyAuthority, isOwnerOf, updateproperty)
router.route('/update-property-images/:id').patch(verifyJWT, verifyAuthority, isOwnerOf, upload.fields([
    {
        name:'images',
        maxCount:15
    }
]), updatePropertyImages)

router.route('/update-property-videos/:id').patch(verifyJWT, verifyAuthority, isOwnerOf, upload.fields([{
    name:'videos',
    maxCount:10
}]), updatePropertyVideos)

router.route('/delete-property-images/:id').patch(verifyJWT,verifyAuthority, isOwnerOf, deletePropertyImages)
router.route('/delete-property-videos/:id').patch(verifyJWT,verifyAuthority, isOwnerOf, deletePropertyVideos)
router.route('/who-visited-property-page/:id').get(verifyJWT, verifyAuthority, isOwnerOf, getWhoVisitedPropertyPage)
router.route('/total-views/:id').get(verifyJWT, verifyAuthority, isOwnerOf, getTotalViews)


// Routes Accesible to all
router.route('/get-single-property/:id').get(verifyJWT, getSingleProperty)
router.route('/get-all-properties/').get(verifyJWT, getAllProperties)

export default router;