# Create Docker and documentation files

backend_files['Dockerfile'] = '''# Use Node.js LTS version
FROM node:18-alpine

# Set working directory
WORKDIR /usr/src/app

# Install system dependencies
RUN apk add --no-cache ffmpeg python3 make g++

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application code
COPY . .

# Create directories
RUN mkdir -p logs uploads

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S speakai -u 1001
RUN chown -R speakai:nodejs /usr/src/app

# Switch to non-root user
USER speakai

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \\
    CMD curl -f http://localhost:5000/health || exit 1

# Start application
CMD ["npm", "start"]
'''

backend_files['docker-compose.yml'] = '''version: '3.8'

services:
  speakai-backend:
    build: .
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=development
      - MONGODB_URI=mongodb://mongodb:27017/speakai
      - JWT_SECRET=dev-secret-key
      - CORS_ORIGIN=http://localhost:3000,http://localhost:5173
    volumes:
      - ./uploads:/usr/src/app/uploads
      - ./logs:/usr/src/app/logs
    depends_on:
      - mongodb
    networks:
      - speakai-network
    restart: unless-stopped

  mongodb:
    image: mongo:6.0
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db
    environment:
      - MONGO_INITDB_DATABASE=speakai
    networks:
      - speakai-network
    restart: unless-stopped

volumes:
  mongodb_data:
    driver: local

networks:
  speakai-network:
    driver: bridge
'''

backend_files['.gitignore'] = '''# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Environment files
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Logs
logs/
*.log

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/
*.lcov

# Uploads
uploads/

# Temporary folders
.tmp/
temp/

# IDE files
.vscode/
.idea/
*.swp
*.swo
*~

# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db
'''

# Create comprehensive README
readme_content = '''# 🎤 SpeakAI Backend

Complete Node.js backend for the SpeakAI platform - AI-powered public speaking confidence training.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
# Edit .env with your settings
```

### 3. Start Development Server
```bash
npm run dev
```

Backend will be running at `http://localhost:5000`

## 🔧 Environment Setup

### Option 1: Local MongoDB
```bash
# Install MongoDB
brew install mongodb/brew/mongodb-community  # macOS
sudo apt install mongodb  # Ubuntu

# Start MongoDB
brew services start mongodb/brew/mongodb-community  # macOS
sudo systemctl start mongod  # Ubuntu

# Set in .env:
MONGODB_URI=mongodb://localhost:27017/speakai
```

### Option 2: MongoDB Atlas (Cloud)
1. Create account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create cluster and get connection string
3. Set in `.env`: `MONGODB_URI=mongodb+srv://...`

### Option 3: Docker
```bash
docker-compose up -d
```

## 🎯 API Endpoints

### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Users
- `GET /api/users/profile` - User profile
- `GET /api/users/dashboard-stats` - Dashboard statistics

### Sessions
- `POST /api/sessions/start` - Start practice session
- `POST /api/sessions/:id/upload` - Upload and analyze audio
- `GET /api/sessions/recent` - Recent sessions

### Progress & Analytics
- `GET /api/progress/overview` - Progress overview
- `GET /api/analytics` - Analytics data

### Achievements
- `GET /api/achievements` - All achievements

### Settings
- `GET /api/settings` - User settings
- `PUT /api/settings/preferences` - Update preferences

## 📊 Demo Data

Create demo user and data:
```bash
npm run seed
```

**Demo Login:**
- Email: `demo@speakai.com`
- Password: `Password123!`

## 🛠️ Development

### Scripts
```bash
npm run dev          # Development server
npm start           # Production server
npm run seed        # Create demo data
npm run db:clear    # Clear database
npm run logs        # View logs
```

### Testing
```bash
# Health check
curl http://localhost:5000/health

# Test login
curl -X POST http://localhost:5000/api/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{"email":"demo@speakai.com","password":"Password123!"}'
```

## 🏗️ Project Structure

```
backend/
├── server.js              # Main server
├── package.json           # Dependencies
├── .env.example          # Environment template
├── models/               # Database schemas
│   ├── User.js
│   └── Session.js
├── routes/               # API routes
│   ├── auth.js
│   ├── users.js
│   ├── sessions.js
│   ├── progress.js
│   ├── achievements.js
│   └── settings.js
├── middleware/           # Custom middleware
│   ├── auth.js
│   ├── errorHandler.js
│   └── rateLimiter.js
├── services/            # Business logic
│   ├── speechAnalysisService.js
│   └── achievementService.js
├── utils/              # Utilities
│   ├── logger.js
│   └── seedData.js
└── config/             # Configuration
    └── database.js
```

## 🔒 Security Features

- JWT authentication with refresh tokens
- Password hashing with bcryptjs
- Rate limiting for API protection
- Input validation with express-validator
- CORS configuration
- Helmet security headers

## 🚀 Deployment

### Railway
```bash
railway login
railway init
railway up
```

### Docker Production
```bash
docker build -t speakai-backend .
docker run -p 5000:5000 speakai-backend
```

## 📈 Features

- ✅ Complete user authentication system
- ✅ Practice session management
- ✅ Audio upload and analysis
- ✅ Real-time speech feedback (mock & real ML)
- ✅ Achievement system with auto-unlocking
- ✅ Progress tracking and analytics
- ✅ User preferences and settings
- ✅ Comprehensive error handling
- ✅ Professional logging
- ✅ Database seeding for development

## 🔧 Troubleshooting

### Port Issues
```bash
lsof -ti:5000
kill -9 <process-id>
```

### Database Connection
```bash
npm run db:status
```

### View Logs
```bash
npm run logs
tail -f logs/error.log
```

## 📝 License

MIT License - see LICENSE file for details.
'''

backend_files['README.md'] = readme_content

print("✅ Created Docker files and documentation")

# Now save all files
print(f"\n🎯 Creating {len(backend_files)} backend files...")

for file_path, content in backend_files.items():
    print(f"📄 {file_path}")

print(f"\n✅ All {len(backend_files)} backend files created successfully!")