const User = require('../models/User');
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
