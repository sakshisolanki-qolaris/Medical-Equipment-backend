import express from 'express';
import { login, registerViewer, logout } from './auth.controller.js';
import { validateLogin, validateRegisterViewer } from './auth.validator.js';
import { verifyToken } from '../../middlewares/auth.middleware.js';
import { loginLimiter } from '../../middlewares/rateLimiter.middleware.js';

const router = express.Router();

router.post('/login',loginLimiter, validateLogin, login);

router.post('/register-viewer',loginLimiter, validateRegisterViewer, registerViewer);

router.post('/logout', verifyToken, logout);

export default router;