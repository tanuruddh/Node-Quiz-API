import express from "express";
import authController from "../controllers/authController.js";

const router = express.Router();
const { signup, login, forgotPassword, protect, resetPassword, logout, getMe, getUser } = authController;

router.post('/signup', signup);
router.post('/login', login);
router.get('/logout', logout);
router.post('/forgotPassword', forgotPassword);
router.patch('/resetPassword/:token', resetPassword);

// routes for getting information about the logged in user
router.get('/me', protect, getMe, getUser);



export default router;