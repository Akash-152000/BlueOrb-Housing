import { Router } from "express";
import { changePassword, loginUser, logoutUser, refreshAccessToken, registerUser } from "../controllers/user.controller.js";
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


export default router;
