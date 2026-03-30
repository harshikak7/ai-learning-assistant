import express from 'express';
import { body } from 'express-validator';
import {
    register,
    login,
    getProfile,
    updateProfile,
    changePassword
} from '../controllers/authController.js';
import protect from '../middleware/auth.js';

const router=express.Router();

//Validation middleware
const registerValidation=[
    body('username')
    .trim()
    .isLength( {min:3} )
    .withMessage('username must be at least 3 characters'),
    body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
    body('password')
    .isLength({min:6})
    .withMessage('Password must have 6 characters')
];

const loginValidation=[
    body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
    body('password')
    .notEmpty()
    .withMessage('Password is required')
];

//Public Routes
router.get('/profile',protect,getProfile);
router.put('/profile',protect,updateProfile);
router.post('/change-password',protect,changePassword);
router.post('/register',register,registerValidation);
router.post('/login',login,loginValidation)
export default router;

  