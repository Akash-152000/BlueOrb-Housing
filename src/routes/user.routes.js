import { Router } from "express";
import { loginUser, logoutUser, refreshAccessToken, registerUser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import {verifyJWT} from '../middlewares/auth.middleware.js'

const router = Router();

router
  .route("/register-user")
  .post(upload.single("profileImage"), registerUser);


router.route("/login-user").post(loginUser)

//Secured Routes
router.route("/logout-user").post(verifyJWT, logoutUser)
router.route("/refresh-access-token").post(refreshAccessToken)

export default router;
