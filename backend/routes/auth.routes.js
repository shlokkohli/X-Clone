import { Router } from "express";
import { signupUser, loginUser, logoutUser, getMe } from '../controllers/auth.controller.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = Router();

router.get("/me", authMiddleware, getMe)
router.post("/signup", signupUser);
router.post("/login", loginUser);
router.post("/logout", authMiddleware, logoutUser);


export default router;