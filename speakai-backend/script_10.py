# Create remaining backend files

# 11. User routes
with open('users-routes.js', 'w') as f:
    f.write(backend_files['routes/users.js'])

# 12. Session routes
with open('sessions-routes.js', 'w') as f:
    f.write(backend_files['routes/sessions.js'])

# 13. Speech analysis service
with open('speechAnalysisService.js', 'w') as f:
    f.write(backend_files['services/speechAnalysisService.js'])

# 14. Achievement service
with open('achievementService.js', 'w') as f:
    f.write(backend_files['services/achievementService.js'])

# 15. Logger utility
with open('logger.js', 'w') as f:
    f.write(backend_files['utils/logger.js'])

# 16. Seed data utility
with open('seedData.js', 'w') as f:
    f.write(backend_files['utils/seedData.js'])

# 17. Achievement routes
with open('achievements-routes.js', 'w') as f:
    f.write(backend_files['routes/achievements.js'])

# 18. Settings routes
with open('settings-routes.js', 'w') as f:
    f.write(backend_files['routes/settings.js'])

# 19. Progress routes
with open('progress-routes.js', 'w') as f:
    f.write(backend_files['routes/progress.js'])

# 20. Analytics routes
with open('analytics-routes.js', 'w') as f:
    f.write(backend_files['routes/analytics.js'])

print("✅ Created next 10 backend files")