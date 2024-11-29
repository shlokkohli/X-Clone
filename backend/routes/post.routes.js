import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { createPost, deletePost, commentOnPost, linkUnlikePost, getAllPosts, getLikedPosts, getFollowingPosts, getUserPosts } from '../controllers/post.controller.js';

const router = Router();

router.get('/all', authMiddleware, getAllPosts);
router.get('/following', authMiddleware, getFollowingPosts);
router.get('/likes/:id', authMiddleware, getLikedPosts);
router.get('/user/:username', authMiddleware, getUserPosts);
router.post('/create', authMiddleware, createPost);
router.post('/like/:id', authMiddleware, linkUnlikePost);
router.post('/comment/:id', authMiddleware, commentOnPost);
router.delete('/:id', authMiddleware, deletePost);

export default router;