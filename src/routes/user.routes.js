import { Router } from "express";
import { changePassword, getCurrentUser, loginUser, logoutUser, refreshAccessToken, registerUser, updateProfileImage, updateUserDetails } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import {verifyJWT} from '../middlewares/auth.middleware.js'

const router = Router();

router
  .route("/register-user")
  .post(upload.single("profileImage"), registerUser);


router.route("/login-user").post(loginUser)
router.route("/refresh-access-token").post(refreshAccessToken)

//Secured Routes
router.route("/logout-user").post(verifyJWT, logoutUser)
router.route("/change-password").post(verifyJWT, changePassword)
router.route("/get-current-user").get(verifyJWT, getCurrentUser)
router.route("/update-user").post(verifyJWT, updateUserDetails)
router.route("/update-profile-image").post(verifyJWT,upload.single("profileImage") , updateProfileImage)


export default router;
