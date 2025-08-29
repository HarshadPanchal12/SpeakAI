const express = require('express');
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
