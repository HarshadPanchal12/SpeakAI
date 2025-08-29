const express = require('express');
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
