import { Router } from 'express';
import { getUserProfile, followUnfollowUser, getSuggestedUser, updateUserProfile } from '../controllers/user.controller.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = Router();

router.get("/profile/:username", authMiddleware, getUserProfile);
router.get("/suggested", authMiddleware, getSuggestedUser);
router.post("/follow/:id", authMiddleware, followUnfollowUser);
router.post("/update", authMiddleware, updateUserProfile);

export default router;