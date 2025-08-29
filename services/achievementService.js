const User = require('../models/User');
const Session = require('../models/Session');
const logger = require('../utils/logger');

const ACHIEVEMENTS = {
    first_session: {
        id: 'first_session',
        title: 'First Steps',
        description: 'Complete your first practice session',
        icon: '🎯',
        points: 10,
        checkCondition: (user, session) => {
            return user.totalSessions === 1;
        }
    },

    consistency: {
        id: 'consistency',
        title: 'Consistent Learner',
        description: 'Practice for 3 consecutive days',
        icon: '📅',
        points: 25,
        checkCondition: (user, session) => {
            return user.streak >= 3;
        }
    },

    confidence_boost: {
        id: 'confidence_boost',
        title: 'Confidence Builder',
        description: 'Reach 50% confidence score',
        icon: '💪',
        points: 50,
        checkCondition: (user, session) => {
            return user.confidenceScore >= 50;
        }
    },

    level_master: {
        id: 'level_master',
        title: 'Level Master',
        description: 'Complete all sessions in one level',
        icon: '👑',
        points: 100,
        checkCondition: (user, session) => {
            return Object.values(user.levels).some(level => level.progress >= 100);
        }
    }
};

async function checkAchievements(user, session) {
    const newAchievements = [];

    try {
        const unlockedIds = user.unlockedAchievements.map(a => a.achievementId);

        for (const [achievementId, achievement] of Object.entries(ACHIEVEMENTS)) {
            if (unlockedIds.includes(achievementId)) {
                continue;
            }

            let conditionMet = false;

            try {
                conditionMet = await achievement.checkCondition(user, session);
            } catch (conditionError) {
                logger.error(`Error checking achievement ${achievementId}:`, conditionError);
                continue;
            }

            if (conditionMet) {
                const unlocked = user.addAchievement(achievementId, achievement.points);

                if (unlocked) {
                    newAchievements.push({
                        id: achievementId,
                        title: achievement.title,
                        description: achievement.description,
                        icon: achievement.icon,
                        points: achievement.points,
                        unlockedAt: new Date()
                    });

                    logger.info(`Achievement unlocked: ${achievementId} for user ${user._id}`);
                }
            }
        }

        if (newAchievements.length > 0) {
            await user.save();
        }

        return newAchievements;

    } catch (error) {
        logger.error('Error checking achievements:', error);
        return [];
    }
}

async function getAllAchievements(userId) {
    try {
        const user = await User.findById(userId);
        if (!user) return [];

        const unlockedIds = user.unlockedAchievements.map(a => a.achievementId);

        return Object.values(ACHIEVEMENTS).map(achievement => ({
            ...achievement,
            unlocked: unlockedIds.includes(achievement.id),
            unlockedAt: user.unlockedAchievements.find(a => a.achievementId === achievement.id)?.unlockedAt || null
        }));

    } catch (error) {
        logger.error('Error getting all achievements:', error);
        return [];
    }
}

module.exports = {
    checkAchievements,
    getAllAchievements,
    ACHIEVEMENTS
};
