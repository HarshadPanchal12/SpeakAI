# Create all the backend files as individual downloadable files

# 1. Main server file
with open('server.js', 'w') as f:
    f.write(backend_files['server.js'])

# 2. Package.json
with open('package.json', 'w') as f:
    f.write(backend_files['package.json'])

# 3. Environment example
with open('.env.example', 'w') as f:
    f.write(backend_files['.env.example'])

# 4. Database config
with open('database.js', 'w') as f:
    f.write(backend_files['config/database.js'])

# 5. User model
with open('User.js', 'w') as f:
    f.write(backend_files['models/User.js'])

# 6. Session model
with open('Session.js', 'w') as f:
    f.write(backend_files['models/Session.js'])

# 7. Auth routes
with open('auth-routes.js', 'w') as f:
    f.write(backend_files['routes/auth.js'])

# 8. Auth middleware
with open('auth-middleware.js', 'w') as f:
    f.write(backend_files['middleware/auth.js'])

# 9. Error handler
with open('errorHandler.js', 'w') as f:
    f.write(backend_files['middleware/errorHandler.js'])

# 10. Rate limiter
with open('rateLimiter.js', 'w') as f:
    f.write(backend_files['middleware/rateLimiter.js'])

print("✅ Created first 10 backend files")