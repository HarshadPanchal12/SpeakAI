const express = require('express');
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
