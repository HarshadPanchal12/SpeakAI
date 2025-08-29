const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();

// Validation rules
const registerValidation = [
    body('name')
        .trim()
        .notEmpty()
        .withMessage('Name is required')
        .isLength({ min: 2, max: 50 })
        .withMessage('Name must be between 2 and 50 characters'),
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email'),
    body('password')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number')
];

const loginValidation = [
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email'),
    body('password')
        .notEmpty()
        .withMessage('Password is required')
];

// Helper function to generate JWT tokens
const generateTokens = (userId) => {
    const accessToken = jwt.sign(
        { userId },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    const refreshToken = jwt.sign(
        { userId, type: 'refresh' },
        process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET,
        { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '30d' }
    );

    return { accessToken, refreshToken };
};

// @route   POST /api/auth/register
// @desc    Register new user
// @access  Public
router.post('/register', registerValidation, async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { name, email, password } = req.body;

        let existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User already exists with this email',
                code: 'USER_EXISTS'
            });
        }

        const user = new User({
            name: name.trim(),
            email,
            password,
            isNewUser: true,
            totalSessions: 0,
            confidenceScore: 0,
            streak: 0,
            points: 0,
            currentLevel: 'beginner'
        });

        await user.save();

        const tokens = generateTokens(user._id);

        logger.info(`New user registered: ${email}`);

        res.status(201).json({
            success: true,
            message: 'Registration successful',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                isNewUser: user.isNewUser,
                totalSessions: user.totalSessions,
                confidenceScore: user.confidenceScore,
                streak: user.streak,
                points: user.points,
                currentLevel: user.currentLevel,
                preferences: user.preferences,
                levels: user.levels,
                joinDate: user.joinDate
            },
            tokens
        });

    } catch (error) {
        logger.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error during registration',
            code: 'REGISTRATION_FAILED'
        });
    }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', loginValidation, async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { email, password } = req.body;

        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password',
                code: 'INVALID_CREDENTIALS'
            });
        }

        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password',
                code: 'INVALID_CREDENTIALS'
            });
        }

        user.lastLoginAt = new Date();
        await user.save();

        const tokens = generateTokens(user._id);

        logger.info(`User logged in: ${email}`);

        res.json({
            success: true,
            message: 'Login successful',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                isNewUser: user.isNewUser,
                totalSessions: user.totalSessions,
                confidenceScore: user.confidenceScore,
                streak: user.streak,
                maxStreak: user.maxStreak,
                points: user.points,
                currentLevel: user.currentLevel,
                preferences: user.preferences,
                levels: user.levels,
                joinDate: user.joinDate,
                lastLoginAt: user.lastLoginAt,
                unlockedAchievements: user.unlockedAchievements
            },
            tokens
        });

    } catch (error) {
        logger.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error during login',
            code: 'LOGIN_FAILED'
        });
    }
});

// @route   GET /api/auth/me
// @desc    Get current user data
// @access  Private
router.get('/me', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
                code: 'USER_NOT_FOUND'
            });
        }

        res.json({
            success: true,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                avatar: user.avatar,
                isNewUser: user.isNewUser,
                totalSessions: user.totalSessions,
                confidenceScore: user.confidenceScore,
                streak: user.streak,
                maxStreak: user.maxStreak,
                points: user.points,
                currentLevel: user.currentLevel,
                preferences: user.preferences,
                levels: user.levels,
                joinDate: user.joinDate,
                lastLoginAt: user.lastLoginAt,
                unlockedAchievements: user.unlockedAchievements,
                emailVerified: user.emailVerified
            }
        });

    } catch (error) {
        logger.error('Get current user error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            code: 'USER_FETCH_FAILED'
        });
    }
});

module.exports = router;
