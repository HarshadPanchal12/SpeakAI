const axios = require('axios');
const logger = require('../utils/logger');

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';
const ENABLE_REAL_ANALYSIS = process.env.ENABLE_REAL_ANALYSIS === 'true';

async function analyzeSpeech(audioBuffer, options = {}) {
    try {
        if (!ENABLE_REAL_ANALYSIS || process.env.MOCK_SPEECH_ANALYSIS === 'true') {
            return generateMockAnalysis(options);
        }

        logger.info('Starting real speech analysis...');

        const FormData = require('form-data');
        const formData = new FormData();
        formData.append('audio', audioBuffer, {
            filename: 'speech.wav',
            contentType: 'audio/wav'
        });

        const response = await axios.post(
            `${ML_SERVICE_URL}/analyze-speech`,
            formData,
            {
                headers: {
                    ...formData.getHeaders(),
                    'Content-Type': 'multipart/form-data'
                },
                timeout: 30000
            }
        );

        const result = response.data;
        logger.info(`Real speech analysis completed: confidence=${result.confidence_score}%`);

        return result;

    } catch (error) {
        logger.error('Speech analysis failed:', error);
        logger.warn('Using fallback mock analysis');
        return generateMockAnalysis(options, true);
    }
}

function generateMockAnalysis(options, isFallback = false) {
    const { level = 'easy', duration = 60, practiceType = 'freestyle' } = options;

    const levelMultipliers = {
        easy: { confidence: 0.8, clarity: 0.9 },
        medium: { confidence: 0.7, clarity: 0.8 },
        hard: { confidence: 0.6, clarity: 0.7 }
    };

    const multiplier = levelMultipliers[level] || levelMultipliers.easy;

    const baseConfidence = 45 + Math.random() * 35;
    const baseClarity = 50 + Math.random() * 35;

    const confidence_score = Math.round(Math.min(100, baseConfidence * multiplier.confidence));
    const clarity_score = Math.round(Math.min(100, baseClarity * multiplier.clarity));
    const volume_stability_score = Math.round(60 + Math.random() * 35);
    const pace_wpm = Math.round(120 + Math.random() * 60);

    const fillerFactor = Math.max(0.5, (100 - confidence_score) / 100);
    const total_filler_count = Math.round(Math.random() * 8 * fillerFactor);

    const filler_breakdown = {
        um: Math.round(total_filler_count * 0.3),
        uh: Math.round(total_filler_count * 0.2),
        like: Math.round(total_filler_count * 0.4),
        you_know: Math.round(total_filler_count * 0.1)
    };

    const transcripts = {
        freestyle: "Hello everyone. I'm here to practice my public speaking skills. Today I want to talk about the importance of confidence in communication.",
        guided: "Following the guided prompts, I'm working on my articulation and pacing. The exercises are helping me focus on clear pronunciation.",
        interview: "Thank you for the opportunity to interview. I have experience in my field and I'm passionate about contributing to your team's success.",
        presentation: "Good morning everyone. Today's presentation covers our quarterly results and future projections. Let me start by outlining key achievements."
    };

    const transcript = transcripts[practiceType] || transcripts.freestyle;

    const feedback = generateFeedback(confidence_score, clarity_score, pace_wpm);
    const improvements = generateImprovements(confidence_score, clarity_score, pace_wpm, total_filler_count);

    return {
        success: !isFallback,
        transcript,
        confidence_score,
        clarity_score,
        volume_stability_score,
        pace_wpm,
        total_filler_count,
        filler_breakdown,
        feedback,
        improvements
    };
}

function generateFeedback(confidence, clarity, pace) {
    const feedback = {};

    if (pace >= 120 && pace <= 160) {
        feedback.pace = { status: 'excellent', message: `Perfect pace at ${pace} WPM!`, value: `${pace} WPM` };
    } else if (pace < 120) {
        feedback.pace = { status: 'slow', message: `Try speaking faster. Current: ${pace} WPM`, value: `${pace} WPM` };
    } else {
        feedback.pace = { status: 'fast', message: `Slow down slightly. Current: ${pace} WPM`, value: `${pace} WPM` };
    }

    if (confidence >= 80) {
        feedback.confidence = { status: 'excellent', message: 'Great confidence level!', value: `${confidence}%` };
    } else if (confidence >= 60) {
        feedback.confidence = { status: 'good', message: 'Good confidence, keep practicing!', value: `${confidence}%` };
    } else {
        feedback.confidence = { status: 'needs_work', message: 'Focus on building confidence', value: `${confidence}%` };
    }

    if (clarity >= 80) {
        feedback.clarity = { status: 'excellent', message: 'Very clear speech!', value: `${clarity}%` };
    } else if (clarity >= 60) {
        feedback.clarity = { status: 'good', message: 'Good clarity, minor improvements possible', value: `${clarity}%` };
    } else {
        feedback.clarity = { status: 'needs_work', message: 'Focus on enunciation and clarity', value: `${clarity}%` };
    }

    const avgScore = (confidence + clarity) / 2;
    if (avgScore >= 80) {
        feedback.overall = { status: 'excellent', message: 'Outstanding performance! Keep up the great work.' };
    } else if (avgScore >= 60) {
        feedback.overall = { status: 'good', message: 'Good progress! Continue practicing to improve further.' };
    } else {
        feedback.overall = { status: 'needs_work', message: 'Keep practicing! Focus on the highlighted areas for improvement.' };
    }

    return feedback;
}

function generateImprovements(confidence, clarity, pace, fillerCount) {
    const improvements = [];

    if (confidence < 70) {
        improvements.push({
            area: 'Confidence',
            suggestion: 'Practice deep breathing before speaking and maintain good posture',
            priority: 'high'
        });
    }

    if (fillerCount > 5) {
        improvements.push({
            area: 'Filler Words',
            suggestion: 'Pause instead of using filler words like "um" and "like"',
            priority: 'medium'
        });
    }

    if (clarity < 70) {
        improvements.push({
            area: 'Clarity',
            suggestion: 'Speak more slowly and focus on clear enunciation of each word',
            priority: 'high'
        });
    }

    if (pace > 180) {
        improvements.push({
            area: 'Pace',
            suggestion: 'Slow down your speaking rate for better comprehension',
            priority: 'medium'
        });
    }

    if (improvements.length === 0) {
        improvements.push({
            area: 'Practice',
            suggestion: 'Continue regular practice sessions to maintain and improve your skills',
            priority: 'low'
        });
    }

    return improvements;
}

module.exports = {
    analyzeSpeech
};
