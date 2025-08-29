# Create Session model and routes

backend_files['models/Session.js'] = '''const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User ID is required'],
        index: true
    },
    
    level: {
        type: String,
        required: [true, 'Level is required'],
        enum: ['easy', 'medium', 'hard']
    },
    practiceType: {
        type: String,
        required: [true, 'Practice type is required'],
        enum: ['freestyle', 'guided', 'interview', 'presentation'],
        default: 'freestyle'
    },
    
    startedAt: {
        type: Date,
        default: Date.now,
        required: true
    },
    completedAt: {
        type: Date,
        default: null
    },
    duration: {
        type: Number,
        default: 0,
        min: 0,
        max: 3600
    },
    
    audioUrl: {
        type: String,
        default: null
    },
    audioSize: {
        type: Number,
        default: 0
    },
    
    transcript: {
        type: String,
        default: null
    },
    confidenceScore: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    clarityScore: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    paceWpm: {
        type: Number,
        default: 0,
        min: 0,
        max: 500
    },
    volumeStability: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    
    fillerCount: {
        total: { type: Number, default: 0 },
        um: { type: Number, default: 0 },
        uh: { type: Number, default: 0 },
        like: { type: Number, default: 0 },
        you_know: { type: Number, default: 0 },
        other: { type: Number, default: 0 }
    },
    
    feedback: {
        pace: {
            status: { type: String, enum: ['excellent', 'good', 'needs_work', 'slow', 'fast'] },
            message: { type: String },
            value: { type: String }
        },
        confidence: {
            status: { type: String, enum: ['excellent', 'good', 'needs_work'] },
            message: { type: String },
            value: { type: String }
        },
        clarity: {
            status: { type: String, enum: ['excellent', 'good', 'needs_work'] },
            message: { type: String },
            value: { type: String }
        },
        overall: {
            status: { type: String, enum: ['excellent', 'good', 'needs_work'] },
            message: { type: String }
        }
    },
    
    improvements: [{
        area: {
            type: String,
            required: true,
            enum: ['Confidence', 'Clarity', 'Pace', 'Filler Words', 'Volume', 'Engagement']
        },
        suggestion: {
            type: String,
            required: true
        },
        priority: {
            type: String,
            enum: ['high', 'medium', 'low'],
            default: 'medium'
        }
    }],
    
    status: {
        type: String,
        enum: ['started', 'recording', 'analyzing', 'completed', 'failed'],
        default: 'started'
    },
    
    mlServiceUsed: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true,
    toJSON: {
        transform: function(doc, ret) {
            delete ret.__v;
            return ret;
        }
    }
});

// Indexes for better performance
sessionSchema.index({ userId: 1, createdAt: -1 });
sessionSchema.index({ level: 1 });
sessionSchema.index({ status: 1 });

// Instance method to calculate overall score
sessionSchema.methods.calculateOverallScore = function() {
    const weights = {
        confidence: 0.4,
        clarity: 0.3,
        pace: 0.2,
        volume: 0.1
    };
    
    return Math.round(
        (this.confidenceScore * weights.confidence) +
        (this.clarityScore * weights.clarity) +
        (this.paceWpm > 0 ? Math.min(this.paceWpm / 2, 50) : 0) * weights.pace +
        (this.volumeStability * weights.volume)
    );
};

// Static method to get recent sessions
sessionSchema.statics.getRecentSessions = function(userId, limit = 5) {
    return this.find({ 
        userId, 
        status: 'completed' 
    })
    .select('level practiceType confidenceScore duration completedAt feedback')
    .sort({ completedAt: -1 })
    .limit(limit);
};

const Session = mongoose.model('Session', sessionSchema);

module.exports = Session;
'''

# Create auth routes
backend_files['routes/auth.js'] = '''const express = require('express');
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
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)/)
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
'''

print("✅ Created Session model and auth routes")