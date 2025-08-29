const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Session = require('../models/Session');
const authMiddleware = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();

// @route   GET /api/users/profile
// @desc    Get user profile data
// @access  Private
router.get('/profile', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
                code: 'USER_NOT_FOUND'
            });
        }

        const recentSessions = await Session.getRecentSessions(req.userId, 3);

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
                unlockedAchievements: user.unlockedAchievements
            },
            recentSessions
        });

    } catch (error) {
        logger.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch profile data',
            code: 'PROFILE_FETCH_FAILED'
        });
    }
});

// @route   GET /api/users/dashboard-stats
// @desc    Get comprehensive dashboard statistics
// @access  Private
router.get('/dashboard-stats', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        const userId = req.userId;

        const sessionStats = await Session.aggregate([
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

        const levelStats = await Session.aggregate([
            { $match: { userId: user._id, status: 'completed' } },
            {
                $group: {
                    _id: '$level',
                    sessions: { $sum: 1 },
                    avgConfidence: { $avg: '$confidenceScore' },
                    bestScore: { $max: '$confidenceScore' },
                    totalTime: { $sum: '$duration' }
                }
            }
        ]);

        const recentActivity = await Session.find({
            userId,
            status: 'completed'
        })
        .select('level practiceType confidenceScore completedAt')
        .sort({ completedAt: -1 })
        .limit(10);

        res.json({
            success: true,
            stats: {
                user: {
                    totalSessions: user.totalSessions,
                    confidenceScore: user.confidenceScore,
                    streak: user.streak,
                    maxStreak: user.maxStreak,
                    points: user.points,
                    currentLevel: user.currentLevel,
                    isNewUser: user.isNewUser
                },
                sessions: sessionStats[0] || {
                    totalSessions: 0,
                    avgConfidence: 0,
                    avgClarity: 0,
                    totalPracticeTime: 0,
                    bestConfidenceScore: 0
                },
                levels: levelStats.reduce((acc, level) => {
                    acc[level._id] = {
                        sessions: level.sessions,
                        avgConfidence: Math.round(level.avgConfidence || 0),
                        bestScore: level.bestScore || 0,
                        totalTime: level.totalTime || 0
                    };
                    return acc;
                }, {}),
                recentActivity,
                achievements: user.unlockedAchievements.length
            }
        });

    } catch (error) {
        logger.error('Get dashboard stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch dashboard statistics',
            code: 'DASHBOARD_STATS_FAILED'
        });
    }
});

module.exports = router;
