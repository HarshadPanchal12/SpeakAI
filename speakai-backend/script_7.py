# Create utility files

backend_files['utils/logger.js'] = '''const winston = require('winston');
const path = require('path');

const fs = require('fs');
const logDir = 'logs';
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
}

const logFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.json()
);

const consoleFormat = winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.printf(({ timestamp, level, message, stack }) => {
        return `${timestamp} ${level}: ${stack || message}`;
    })
);

const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: logFormat,
    defaultMeta: { service: 'speakai-backend' },
    transports: [
        new winston.transports.File({
            filename: path.join(logDir, 'error.log'),
            level: 'error',
            maxsize: 5242880,
            maxFiles: 5
        }),
        new winston.transports.File({
            filename: path.join(logDir, 'combined.log'),
            maxsize: 5242880,
            maxFiles: 5
        })
    ]
});

if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: consoleFormat
    }));
}

logger.stream = {
    write: (message) => {
        logger.info(message.trim());
    }
};

module.exports = logger;
'''

backend_files['utils/seedData.js'] = '''const User = require('../models/User');
const Session = require('../models/Session');
const logger = require('./logger');

async function seedDatabase() {
    try {
        logger.info('🌱 Seeding database with sample data...');

        const existingUsers = await User.countDocuments();
        if (existingUsers > 0) {
            logger.info('Database already contains data, skipping seeding');
            return;
        }

        const demoUser = new User({
            name: 'Demo User',
            email: 'demo@speakai.com',
            password: 'Password123!',
            isNewUser: false,
            totalSessions: 5,
            confidenceScore: 75,
            streak: 3,
            maxStreak: 5,
            points: 150,
            currentLevel: 'intermediate',
            preferences: {
                theme: 'dark',
                notifications: true,
                reminderTime: '18:00'
            },
            levels: {
                easy: {
                    progress: 80,
                    status: 'available',
                    sessions: 3,
                    bestScore: 85,
                    totalTime: 480
                },
                medium: {
                    progress: 40,
                    status: 'available',
                    sessions: 2,
                    bestScore: 72,
                    totalTime: 300
                },
                hard: {
                    progress: 0,
                    status: 'available',
                    sessions: 0,
                    bestScore: 0,
                    totalTime: 0
                }
            },
            unlockedAchievements: [
                {
                    achievementId: 'first_session',
                    points: 10,
                    unlockedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                },
                {
                    achievementId: 'consistency',
                    points: 25,
                    unlockedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
                }
            ]
        });

        await demoUser.save();
        logger.info(`Created demo user: ${demoUser.email}`);

        // Create sample sessions
        const sessions = [];
        for (let i = 0; i < 5; i++) {
            const sessionDate = new Date(Date.now() - (5 - i) * 24 * 60 * 60 * 1000);
            const level = i < 3 ? 'easy' : 'medium';
            
            const session = new Session({
                userId: demoUser._id,
                level,
                practiceType: 'freestyle',
                startedAt: sessionDate,
                completedAt: new Date(sessionDate.getTime() + 120000),
                duration: 120,
                status: 'completed',
                transcript: `Sample practice session ${i + 1}. Working on ${level} level practice.`,
                confidenceScore: Math.floor(Math.random() * 20 + 65 + (i * 2)),
                clarityScore: Math.floor(Math.random() * 15 + 70 + (i * 1.5)),
                paceWpm: Math.floor(Math.random() * 30 + 130),
                volumeStability: Math.floor(Math.random() * 20 + 70),
                fillerCount: {
                    total: Math.floor(Math.random() * 5),
                    um: Math.floor(Math.random() * 2),
                    uh: Math.floor(Math.random() * 1),
                    like: Math.floor(Math.random() * 3),
                    you_know: Math.floor(Math.random() * 1),
                    other: 0
                },
                feedback: {
                    overall: {
                        status: 'good',
                        message: 'Great progress! Keep practicing.'
                    },
                    confidence: {
                        status: 'good',
                        message: 'Building confidence nicely.',
                        value: '75%'
                    }
                },
                improvements: [
                    {
                        area: 'Confidence',
                        suggestion: 'Continue regular practice',
                        priority: 'medium'
                    }
                ]
            });

            sessions.push(session);
        }

        await Session.insertMany(sessions);
        logger.info(`Created ${sessions.length} sample sessions`);

        logger.info('✅ Database seeded successfully!');
        logger.info('🔑 Demo Login Credentials:');
        logger.info('   Email: demo@speakai.com');
        logger.info('   Password: Password123!');

    } catch (error) {
        logger.error('❌ Database seeding failed:', error);
        throw error;
    }
}

async function clearDatabase() {
    try {
        logger.warn('🗑️ Clearing database...');
        
        await User.deleteMany({});
        await Session.deleteMany({});
        
        logger.info('✅ Database cleared successfully');
        
    } catch (error) {
        logger.error('❌ Database clearing failed:', error);
        throw error;
    }
}

module.exports = {
    seedDatabase,
    clearDatabase
};
'''

# Create remaining route files
backend_files['routes/achievements.js'] = '''const express = require('express');
const authMiddleware = require('../middleware/auth');
const { getAllAchievements } = require('../services/achievementService');
const logger = require('../utils/logger');

const router = express.Router();

// @route   GET /api/achievements
// @desc    Get all achievements with user progress
// @access  Private
router.get('/', authMiddleware, async (req, res) => {
    try {
        const achievements = await getAllAchievements(req.userId);
        
        res.json({
            success: true,
            achievements
        });

    } catch (error) {
        logger.error('Get achievements error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch achievements',
            code: 'ACHIEVEMENTS_FETCH_FAILED'
        });
    }
});

module.exports = router;
'''

backend_files['routes/settings.js'] = '''const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();

// @route   GET /api/settings
// @desc    Get user settings
// @access  Private
router.get('/', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.userId).select('preferences');
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            settings: user.preferences
        });

    } catch (error) {
        logger.error('Get settings error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch settings'
        });
    }
});

// @route   PUT /api/settings/preferences
// @desc    Update user preferences
// @access  Private
router.put('/preferences', authMiddleware, [
    body('theme').optional().isIn(['light', 'dark', 'auto']),
    body('notifications').optional().isBoolean(),
    body('reminderTime').optional().matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
    body('language').optional().isIn(['en', 'es', 'fr', 'de'])
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { theme, notifications, reminderTime, language } = req.body;
        
        const updateData = {};
        if (theme !== undefined) updateData['preferences.theme'] = theme;
        if (notifications !== undefined) updateData['preferences.notifications'] = notifications;
        if (reminderTime !== undefined) updateData['preferences.reminderTime'] = reminderTime;
        if (language !== undefined) updateData['preferences.language'] = language;

        const user = await User.findByIdAndUpdate(
            req.userId,
            updateData,
            { new: true, runValidators: true }
        ).select('preferences');

        res.json({
            success: true,
            message: 'Preferences updated successfully',
            settings: user.preferences
        });

    } catch (error) {
        logger.error('Update preferences error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update preferences'
        });
    }
});

module.exports = router;
'''

backend_files['routes/progress.js'] = '''const express = require('express');
const Session = require('../models/Session');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();

// @route   GET /api/progress/overview
// @desc    Get user progress overview
// @access  Private
router.get('/overview', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const progressData = await Session.aggregate([
            { $match: { userId: user._id, status: 'completed' } },
            {
                $group: {
                    _id: null,
                    totalSessions: { $sum: 1 },
                    avgConfidence: { $avg: '$confidenceScore' },
                    avgClarity: { $avg: '$clarityScore' },
                    totalPracticeTime: { $sum: '$duration' },
                    bestConfidenceScore: { $max: '$confidenceScore' }
                }
            }
        ]);

        const stats = progressData[0] || {
            totalSessions: 0,
            avgConfidence: 0,
            avgClarity: 0,
            totalPracticeTime: 0,
            bestConfidenceScore: 0
        };

        res.json({
            success: true,
            progress: {
                user: {
                    totalSessions: user.totalSessions,
                    confidenceScore: user.confidenceScore,
                    streak: user.streak,
                    maxStreak: user.maxStreak,
                    points: user.points
                },
                overall: {
                    totalSessions: stats.totalSessions,
                    avgConfidence: Math.round(stats.avgConfidence || 0),
                    avgClarity: Math.round(stats.avgClarity || 0),
                    totalPracticeTime: stats.totalPracticeTime,
                    bestConfidenceScore: stats.bestConfidenceScore || 0
                }
            }
        });

    } catch (error) {
        logger.error('Get progress overview error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch progress data'
        });
    }
});

module.exports = router;
'''

backend_files['routes/analytics.js'] = '''const express = require('express');
const Session = require('../models/Session');
const authMiddleware = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();

// @route   GET /api/analytics
// @desc    Get analytics data
// @access  Private
router.get('/', authMiddleware, async (req, res) => {
    try {
        const sessions = await Session.find({
            userId: req.userId,
            status: 'completed'
        }).select('confidenceScore clarityScore completedAt level').sort({ completedAt: -1 }).limit(10);

        res.json({
            success: true,
            analytics: {
                recentSessions: sessions,
                summary: {
                    totalSessions: sessions.length,
                    avgConfidence: sessions.length > 0 
                        ? Math.round(sessions.reduce((sum, s) => sum + s.confidenceScore, 0) / sessions.length)
                        : 0
                }
            }
        });

    } catch (error) {
        logger.error('Get analytics error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch analytics'
        });
    }
});

module.exports = router;
'''

print("✅ Created utility files and remaining routes")