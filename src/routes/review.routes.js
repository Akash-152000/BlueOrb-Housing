import { Router } from "express";
import { isOwnerOf, verifyAuthority, verifyJWT } from "../middlewares/auth.middleware.js";
import { addReview, deleteMyReview, deleteSingleReview, getAllReviews } from "../controllers/review.controller.js";

const router = Router();

router.route('/get-all-reviews/:id').get(verifyJWT, getAllReviews)

//For users
router.route('/add-review/:id').post(verifyJWT, addReview)
router.route('/delete-my-review/:id').delete(verifyJWT, deleteMyReview)

//For Owners
router.route('/delete-single-review/:id').delete(verifyJWT, verifyAuthority, deleteSingleReview)

export default router;
