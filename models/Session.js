const mongoose = require('mongoose');

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
