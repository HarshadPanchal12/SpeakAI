# Create models

# User model
backend_files['models/User.js'] = '''const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    // Basic user information
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
        maxLength: [50, 'Name cannot exceed 50 characters']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\\w+([\\.-]?\\w+)*@\\w+([\\.-]?\\w+)*(\\.\\w{2,3})+$/, 'Please provide a valid email']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minLength: [8, 'Password must be at least 8 characters'],
        select: false
    },
    avatar: {
        type: String,
        default: null
    },
    
    // User status and progress - matching frontend userData structure
    isNewUser: {
        type: Boolean,
        default: true
    },
    joinDate: {
        type: Date,
        default: Date.now
    },
    lastLoginAt: {
        type: Date,
        default: Date.now
    },
    
    // Statistics - exactly matching frontend structure
    totalSessions: {
        type: Number,
        default: 0,
        min: 0
    },
    confidenceScore: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    streak: {
        type: Number,
        default: 0,
        min: 0
    },
    maxStreak: {
        type: Number,
        default: 0,
        min: 0
    },
    points: {
        type: Number,
        default: 0,
        min: 0
    },
    currentLevel: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced'],
        default: 'beginner'
    },
    
    // User preferences - matching frontend structure
    preferences: {
        theme: {
            type: String,
            enum: ['light', 'dark', 'auto'],
            default: 'dark'
        },
        notifications: {
            type: Boolean,
            default: true
        },
        reminderTime: {
            type: String,
            default: '18:00',
            match: [/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format']
        },
        language: {
            type: String,
            default: 'en',
            enum: ['en', 'es', 'fr', 'de']
        },
        soundEffects: {
            type: Boolean,
            default: true
        }
    },
    
    // Level progress - matching frontend levels structure
    levels: {
        easy: {
            progress: { type: Number, default: 0, min: 0, max: 100 },
            status: { type: String, default: 'available', enum: ['locked', 'available', 'completed'] },
            sessions: { type: Number, default: 0, min: 0 },
            bestScore: { type: Number, default: 0, min: 0, max: 100 },
            totalTime: { type: Number, default: 0, min: 0 }
        },
        medium: {
            progress: { type: Number, default: 0, min: 0, max: 100 },
            status: { type: String, default: 'available', enum: ['locked', 'available', 'completed'] },
            sessions: { type: Number, default: 0, min: 0 },
            bestScore: { type: Number, default: 0, min: 0, max: 100 },
            totalTime: { type: Number, default: 0, min: 0 }
        },
        hard: {
            progress: { type: Number, default: 0, min: 0, max: 100 },
            status: { type: String, default: 'available', enum: ['locked', 'available', 'completed'] },
            sessions: { type: Number, default: 0, min: 0 },
            bestScore: { type: Number, default: 0, min: 0, max: 100 },
            totalTime: { type: Number, default: 0, min: 0 }
        }
    },
    
    // Achievement tracking
    unlockedAchievements: [{
        achievementId: {
            type: String,
            required: true
        },
        unlockedAt: {
            type: Date,
            default: Date.now
        },
        points: {
            type: Number,
            required: true
        }
    }],
    
    // Account status
    isActive: {
        type: Boolean,
        default: true
    },
    emailVerified: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true,
    toJSON: { 
        transform: function(doc, ret) {
            delete ret.password;
            delete ret.__v;
            return ret;
        }
    }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    
    try {
        const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_ROUNDS) || 12);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Instance method to check password
userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Instance method to update user statistics
userSchema.methods.updateStats = function(sessionData) {
    this.totalSessions += 1;
    this.confidenceScore = Math.max(this.confidenceScore, sessionData.confidenceScore || 0);
    this.lastSessionAt = new Date();
    
    // Update level-specific stats
    const level = sessionData.level || 'easy';
    if (this.levels[level]) {
        this.levels[level].sessions += 1;
        this.levels[level].bestScore = Math.max(this.levels[level].bestScore, sessionData.confidenceScore || 0);
        this.levels[level].totalTime += sessionData.duration || 0;
        
        const progressIncrement = level === 'easy' ? 10 : level === 'medium' ? 8 : 6;
        this.levels[level].progress = Math.min(100, this.levels[level].progress + progressIncrement);
    }
    
    if (this.isNewUser && this.totalSessions >= 1) {
        this.isNewUser = false;
    }
};

// Instance method to update streak
userSchema.methods.updateStreak = function() {
    const now = new Date();
    const lastSession = this.lastSessionAt;
    
    if (!lastSession) {
        this.streak = 1;
    } else {
        const daysDiff = Math.floor((now - lastSession) / (1000 * 60 * 60 * 24));
        
        if (daysDiff === 1) {
            this.streak += 1;
        } else if (daysDiff > 1) {
            this.streak = 1;
        }
    }
    
    this.maxStreak = Math.max(this.maxStreak, this.streak);
};

// Instance method to add achievement
userSchema.methods.addAchievement = function(achievementId, points) {
    const existingAchievement = this.unlockedAchievements.find(
        a => a.achievementId === achievementId
    );
    
    if (!existingAchievement) {
        this.unlockedAchievements.push({
            achievementId,
            points,
            unlockedAt: new Date()
        });
        this.points += points;
        return true;
    }
    return false;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
'''

print("✅ Created User model")