import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { addReview } from "../controllers/review.controller.js";

const router = Router();

router.route('/add-review/:id').post(verifyJWT, addReview)

export default router;
