# Continue creating backend files

# 2. package.json
import json

package_json = {
    "name": "speakai-backend",
    "version": "1.0.0",
    "description": "Complete backend for SpeakAI - AI-powered public speaking confidence platform",
    "main": "server.js",
    "scripts": {
        "dev": "nodemon server.js",
        "start": "node server.js",
        "build": "echo 'Build completed'",
        "test": "jest",
        "lint": "eslint src/",
        "format": "prettier --write src/",
        "seed": "node -e \"require('./utils/seedData').seedDatabase().then(() => process.exit(0))\"",
        "db:clear": "node -e \"require('./utils/seedData').clearDatabase().then(() => process.exit(0))\"",
        "logs": "tail -f logs/combined.log"
    },
    "keywords": ["speakai", "public speaking", "ai", "confidence", "speech analysis"],
    "author": "SpeakAI Team",
    "license": "MIT",
    "dependencies": {
        "express": "^4.18.2",
        "mongoose": "^7.5.0",
        "cors": "^2.8.5",
        "dotenv": "^16.3.1",
        "bcryptjs": "^2.4.3",
        "jsonwebtoken": "^9.0.2",
        "multer": "^1.4.5",
        "express-validator": "^7.0.1",
        "express-rate-limit": "^7.1.5",
        "helmet": "^7.1.0",
        "compression": "^1.7.4",
        "morgan": "^1.10.0",
        "winston": "^3.10.0",
        "socket.io": "^4.7.2",
        "cloudinary": "^1.40.0",
        "nodemailer": "^6.9.4",
        "cron": "^2.4.4",
        "uuid": "^9.0.0",
        "moment": "^2.29.4",
        "joi": "^17.9.2",
        "axios": "^1.5.0",
        "form-data": "^4.0.0"
    },
    "devDependencies": {
        "nodemon": "^3.0.1",
        "jest": "^29.6.2",
        "supertest": "^6.3.3",
        "eslint": "^8.47.0",
        "prettier": "^3.0.2"
    },
    "engines": {
        "node": ">=16.0.0"
    }
}

backend_files['package.json'] = json.dumps(package_json, indent=2)

# 3. .env.example
backend_files['.env.example'] = '''# SpeakAI Backend Environment Configuration

# Server Configuration
NODE_ENV=development
PORT=5000
API_VERSION=v1

# Database Configuration (MongoDB)
MONGODB_URI=mongodb://localhost:27017/speakai
# For MongoDB Atlas: 
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/speakai?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=speakai-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d
REFRESH_TOKEN_SECRET=speakai-refresh-token-secret-change-in-production
REFRESH_TOKEN_EXPIRES_IN=30d

# Security Configuration  
BCRYPT_ROUNDS=12
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW_MS=900000

# CORS Configuration
CORS_ORIGIN=http://localhost:3000,http://localhost:5173
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173,http://127.0.0.1:5500

# File Upload Configuration
MAX_FILE_SIZE=10MB
UPLOAD_PATH=uploads/
ALLOWED_FILE_TYPES=audio/wav,audio/mp3,audio/mp4,audio/mpeg,audio/webm

# Cloudinary Configuration (for file storage)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Email Configuration (for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FROM_EMAIL=noreply@speakai.com
FROM_NAME=SpeakAI Platform

# AI/ML Service Configuration
ML_SERVICE_URL=http://localhost:8000
SPEECH_ANALYSIS_TIMEOUT=30000
ENABLE_REAL_ANALYSIS=false
MOCK_SPEECH_ANALYSIS=true

# Development Flags
DEBUG_MODE=true
SEED_DATABASE=true
'''

# 4. Database configuration
backend_files['config/database.js'] = '''const mongoose = require('mongoose');
const logger = require('../utils/logger');

const connectDB = async () => {
    try {
        const options = {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        };

        const conn = await mongoose.connect(process.env.MONGODB_URI, options);
        
        logger.info(`✅ MongoDB Connected: ${conn.connection.host}`);
        
        // Connection event listeners
        mongoose.connection.on('error', (err) => {
            logger.error('MongoDB connection error:', err);
        });
        
        mongoose.connection.on('disconnected', () => {
            logger.warn('MongoDB disconnected');
        });
        
        return conn;
    } catch (error) {
        logger.error('MongoDB connection failed:', error);
        throw error;
    }
};

module.exports = { connectDB };
'''

print("✅ Created package.json, .env.example, and database config")