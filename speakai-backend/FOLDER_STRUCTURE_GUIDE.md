# 📁 SpeakAI Backend Folder Structure Guide

After downloading all backend files, organize them in this structure:

```
📁 speakai-backend/
├── 📄 server.js                    # Main server file
├── 📄 package.json                 # Dependencies
├── 📄 .env.example                 # Environment template
├── 📄 Dockerfile                   # Container config
├── 📄 docker-compose.yml           # Development stack
├── 📄 .gitignore                   # Git ignore rules
├── 📄 README.md                    # Documentation
│
├── 📁 config/
│   └── 📄 database.js              # MongoDB connection
│
├── 📁 models/
│   ├── 📄 User.js                  # User schema
│   └── 📄 Session.js               # Session schema
│
├── 📁 routes/
│   ├── 📄 auth.js                  # Authentication routes
│   ├── 📄 users.js                 # User routes
│   ├── 📄 sessions.js              # Session routes
│   ├── 📄 progress.js              # Progress routes
│   ├── 📄 achievements.js          # Achievement routes
│   ├── 📄 settings.js              # Settings routes
│   └── 📄 analytics.js             # Analytics routes
│
├── 📁 middleware/
│   ├── 📄 auth.js                  # JWT authentication
│   ├── 📄 errorHandler.js          # Error handling
│   └── 📄 rateLimiter.js           # Rate limiting
│
├── 📁 services/
│   ├── 📄 speechAnalysisService.js # Speech analysis
│   └── 📄 achievementService.js    # Achievement logic
│
├── 📁 utils/
│   ├── 📄 logger.js                # Winston logger
│   └── 📄 seedData.js              # Database seeding
│
└── 📁 logs/                        # (Created automatically)
    ├── combined.log
    └── error.log
```

## 🔗 File Mapping (Downloaded → Project Structure)

| Downloaded File | Project Location |
|-----------------|------------------|
| `server.js` | `/server.js` |
| `package.json` | `/package.json` |
| `.env.example` | `/.env.example` |
| `Dockerfile-backend` → | `/Dockerfile` |
| `docker-compose-backend.yml` → | `/docker-compose.yml` |
| `gitignore-backend` → | `/.gitignore` |
| `README-backend.md` → | `/README.md` |
| `database.js` | `/config/database.js` |
| `User.js` | `/models/User.js` |
| `Session.js` | `/models/Session.js` |
| `auth-routes.js` → | `/routes/auth.js` |
| `users-routes.js` → | `/routes/users.js` |
| `sessions-routes.js` → | `/routes/sessions.js` |
| `progress-routes.js` → | `/routes/progress.js` |
| `achievements-routes.js` → | `/routes/achievements.js` |
| `settings-routes.js` → | `/routes/settings.js` |
| `analytics-routes.js` → | `/routes/analytics.js` |
| `auth-middleware.js` → | `/middleware/auth.js` |
| `errorHandler.js` | `/middleware/errorHandler.js` |
| `rateLimiter.js` | `/middleware/rateLimiter.js` |
| `speechAnalysisService.js` | `/services/speechAnalysisService.js` |
| `achievementService.js` | `/services/achievementService.js` |
| `logger.js` | `/utils/logger.js` |
| `seedData.js` | `/utils/seedData.js` |

## 🚀 Quick Setup After Download

1. **Create project folder:**
   ```bash
   mkdir speakai-backend
   cd speakai-backend
   ```

2. **Create subfolders:**
   ```bash
   mkdir config models routes middleware services utils logs
   ```

3. **Move downloaded files** to their correct locations according to the mapping above

4. **Install dependencies:**
   ```bash
   npm install
   ```

5. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your MongoDB URI and JWT secret
   ```

6. **Start development:**
   ```bash
   npm run dev
   ```

Your complete SpeakAI backend will be ready! 🎉
