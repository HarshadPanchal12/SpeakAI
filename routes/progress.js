const express = require('express');
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
