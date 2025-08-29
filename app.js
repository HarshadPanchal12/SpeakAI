// SpeakAI - Complete Feature-Rich Application (Fixed Version)
class SpeakAIApp {
    constructor() {
        // Application state
        this.currentUser = null;
        this.currentPage = 'landing';
        this.practiceSession = null;
        this.theme = 'auto';
        this.isRecording = false;
        this.confidenceScore = 0;
        
        // Three.js components
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.particles = [];
        
        // Audio components
        this.audioContext = null;
        this.mediaStream = null;
        this.analyser = null;
        
        // User data structure matching requirements
        this.userData = {
            user: {
                name: "Harshad",
                email: "harshad@example.com",
                joinDate: "2025-08-27",
                isNewUser: true,
                totalSessions: 0,
                confidenceScore: 0,
                streak: 0,
                currentLevel: "beginner",
                points: 0,
                achievements: [],
                preferences: {
                    theme: "dark",
                    notifications: true,
                    reminderTime: "18:00"
                }
            },
            levels: [
                {
                    id: "easy",
                    title: "Easy Level",
                    subtitle: "Basic Speech Practice",
                    description: "Short 1-3 minute practice sessions. Perfect for beginners building fundamental confidence.",
                    duration: "1-3 mins",
                    difficulty: 1,
                    progress: 0,
                    status: "available",
                    sessions: 0,
                    bestScore: 0,
                    icon: "🟢",
                    color: "#4CAF50"
                },
                {
                    id: "medium",
                    title: "Medium Level", 
                    subtitle: "Intermediate Presentations",
                    description: "3-5 minute structured presentations. Build storytelling and engagement skills.",
                    duration: "3-5 mins",
                    difficulty: 2,
                    progress: 0,
                    status: "available",
                    sessions: 0,
                    bestScore: 0,
                    icon: "🟡",
                    color: "#FF9800"
                },
                {
                    id: "hard",
                    title: "Hard Level",
                    subtitle: "Advanced Public Speaking", 
                    description: "5+ minute complex presentations. Master advanced techniques and handle Q&A sessions.",
                    duration: "5+ mins",
                    difficulty: 3,
                    progress: 0,
                    status: "available",
                    sessions: 0,
                    bestScore: 0,
                    icon: "🔴",
                    color: "#F44336"
                }
            ],
            achievements: [
                {
                    id: "first_session",
                    title: "First Steps",
                    description: "Complete your first practice session",
                    icon: "🎯",
                    points: 10,
                    unlocked: false
                },
                {
                    id: "consistency", 
                    title: "Consistent Learner",
                    description: "Practice for 3 consecutive days",
                    icon: "📅",
                    points: 25,
                    unlocked: false
                },
                {
                    id: "confidence_boost",
                    title: "Confidence Builder", 
                    description: "Reach 50% confidence score",
                    icon: "💪",
                    points: 50,
                    unlocked: false
                },
                {
                    id: "level_master",
                    title: "Level Master",
                    description: "Complete all sessions in one level", 
                    icon: "👑",
                    points: 100,
                    unlocked: false
                }
            ]
        };
        
        console.log('🎤 SpeakAI App initialized');
    }

    async init() {
        console.log('🎤 Initializing SpeakAI Platform...');
        
        // Setup loading sequence first
        await this.setupLoadingSequence();
        
        // Initialize theme
        this.initializeTheme();
        
        // Setup event listeners after DOM is ready
        this.setupEventListeners();
        
        // Initialize Three.js
        this.initThreeJS();
        
        // Setup animations
        this.setupAnimations();
        
        console.log('✅ SpeakAI Platform fully initialized!');
    }

    async setupLoadingSequence() {
        const loadingScreen = document.getElementById('loadingScreen');
        const progressFill = document.querySelector('.progress-fill');
        
        // Animate progress bar
        if (progressFill) {
            progressFill.style.animation = 'loadingProgress 3s ease-in-out forwards';
        }
        
        // Wait for loading to complete
        await new Promise(resolve => setTimeout(resolve, 3500));
        
        // Hide loading screen
        if (loadingScreen) {
            loadingScreen.classList.add('hidden');
            setTimeout(() => {
                this.showToast('Welcome to SpeakAI! Your confidence journey starts here.', 'success');
            }, 500);
        }
    }

    initializeTheme() {
        // Set default theme
        this.setTheme('light'); // Start with light theme
    }

    setTheme(theme) {
        this.theme = theme;
        
        if (theme === 'auto') {
            // Use system preference
            document.documentElement.removeAttribute('data-color-scheme');
        } else {
            document.documentElement.setAttribute('data-color-scheme', theme);
        }
        
        // Update theme select if it exists
        const themeSelect = document.getElementById('themeSelect');
        if (themeSelect) {
            themeSelect.value = theme;
        }
    }

    setupEventListeners() {
        console.log('Setting up event listeners...');
        
        // Wait a bit for DOM to be fully ready
        setTimeout(() => {
            // Theme toggle
            this.setupThemeToggle();
            
            // Navigation
            this.setupNavigationListeners();
            
            // Authentication
            this.setupAuthListeners();
            
            // Dashboard
            this.setupDashboardListeners();
            
            // Practice
            this.setupPracticeListeners();
            
            // Settings
            this.setupSettingsListeners();
            
            // Modal handlers
            this.setupModalListeners();
            
            // General UI
            this.setupUIListeners();
            
            console.log('✅ All event listeners set up');
        }, 100);
    }

    setupThemeToggle() {
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.toggleTheme();
            });
            console.log('✅ Theme toggle setup');
        }
    }

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-color-scheme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        this.setTheme(newTheme);
        this.showToast(`Switched to ${newTheme} theme`, 'success');
    }

    setupNavigationListeners() {
        console.log('Setting up navigation listeners...');
        
        // Main CTA buttons - these should show auth
        const ctaButtons = [
            '#heroCta', 
            '#ctaPrimary', 
            '#ctaNavBtn'
        ];
        
        ctaButtons.forEach(selector => {
            const btn = document.querySelector(selector);
            if (btn) {
                // Remove any existing listeners
                const newBtn = btn.cloneNode(true);
                btn.parentNode.replaceChild(newBtn, btn);
                
                // Add click listener
                newBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('CTA button clicked:', selector);
                    this.showAuth();
                });
                console.log(`✅ CTA button setup: ${selector}`);
            } else {
                console.warn(`❌ CTA button not found: ${selector}`);
            }
        });

        // Nav links for smooth scrolling
        document.querySelectorAll('a[href^="#"]').forEach(link => {
            if (!link.classList.contains('nav-item')) { // Skip dashboard nav items
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    const href = link.getAttribute('href');
                    if (href && href !== '#') {
                        this.smoothScrollTo(href);
                    }
                });
            }
        });

        // Dashboard navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const page = item.getAttribute('data-page');
                if (page) {
                    this.showDashboardPage(page);
                }
            });
        });

        // Mobile menu toggle
        const mobileToggle = document.getElementById('mobileToggle');
        if (mobileToggle) {
            mobileToggle.addEventListener('click', () => {
                this.showToast('Mobile menu - Feature coming soon!', 'info');
            });
        }

        // Sidebar toggle
        const sidebarToggle = document.getElementById('sidebarToggle');
        if (sidebarToggle) {
            sidebarToggle.addEventListener('click', () => {
                const sidebar = document.getElementById('sidebar');
                if (sidebar) {
                    sidebar.classList.toggle('open');
                }
            });
        }

        // Logout
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.logout();
            });
        }

        // Demo button
        const demoBtn = document.getElementById('demoBtn');
        if (demoBtn) {
            demoBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.showModal('demoModal');
            });
        }

        console.log('✅ Navigation listeners setup complete');
    }

    setupAuthListeners() {
        // Form switching
        const switchToRegister = document.getElementById('switchToRegister');
        const switchToLogin = document.getElementById('switchToLogin');
        
        if (switchToRegister) {
            switchToRegister.addEventListener('click', (e) => {
                e.preventDefault();
                this.showAuthForm('register');
            });
        }
        
        if (switchToLogin) {
            switchToLogin.addEventListener('click', (e) => {
                e.preventDefault();
                this.showAuthForm('login');
            });
        }

        // Password toggles
        document.querySelectorAll('.password-toggle').forEach(toggle => {
            toggle.addEventListener('click', (e) => {
                e.preventDefault();
                const input = e.target.closest('.password-input').querySelector('input');
                const icon = e.target.closest('.password-toggle').querySelector('i');
                
                if (input.type === 'password') {
                    input.type = 'text';
                    icon.classList.remove('fa-eye');
                    icon.classList.add('fa-eye-slash');
                } else {
                    input.type = 'password';
                    icon.classList.remove('fa-eye-slash');
                    icon.classList.add('fa-eye');
                }
            });
        });

        // Password strength checker
        const registerPassword = document.getElementById('registerPassword');
        if (registerPassword) {
            registerPassword.addEventListener('input', (e) => this.checkPasswordStrength(e.target.value));
        }

        // Form submissions
        const loginForm = document.getElementById('loginFormElement');
        const registerForm = document.getElementById('registerFormElement');
        
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }
        
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => this.handleRegister(e));
        }

        console.log('✅ Auth listeners setup');
    }

    setupDashboardListeners() {
        // Quick start buttons
        document.querySelectorAll('#quickStartBtn, #startJourneyBtn').forEach(btn => {
            if (btn) {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.showDashboardPage('practice');
                });
            }
        });

        // Level start buttons
        document.querySelectorAll('.level-start-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const levelCard = e.target.closest('.level-card');
                const level = levelCard ? levelCard.getAttribute('data-level') : 'easy';
                this.startPracticeSession(level);
            });
        });

        // First session button
        const firstSessionBtn = document.getElementById('startFirstSession');
        if (firstSessionBtn) {
            firstSessionBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.showDashboardPage('practice');
            });
        }

        console.log('✅ Dashboard listeners setup');
    }

    setupPracticeListeners() {
        // Practice type selection
        document.querySelectorAll('.practice-type-card').forEach(card => {
            card.addEventListener('click', (e) => {
                e.preventDefault();
                // Remove previous selection
                document.querySelectorAll('.practice-type-card').forEach(c => c.classList.remove('selected'));
                // Select current
                card.classList.add('selected');
                
                const type = card.getAttribute('data-type');
                this.showPracticeSession(type);
            });
        });

        // Practice controls
        const recordBtn = document.getElementById('recordBtn');
        const pauseBtn = document.getElementById('pauseBtn');
        const resumeBtn = document.getElementById('resumeBtn');
        const endSessionBtn = document.getElementById('endSessionBtn');

        if (recordBtn) {
            recordBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.startRecording();
            });
        }
        
        if (pauseBtn) {
            pauseBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.pauseRecording();
            });
        }
        
        if (resumeBtn) {
            resumeBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.resumeRecording();
            });
        }
        
        if (endSessionBtn) {
            endSessionBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.endPracticeSession();
            });
        }

        console.log('✅ Practice listeners setup');
    }

    setupSettingsListeners() {
        // Theme selector
        const themeSelect = document.getElementById('themeSelect');
        if (themeSelect) {
            themeSelect.addEventListener('change', (e) => this.setTheme(e.target.value));
        }

        // Notifications toggle
        const notificationsToggle = document.getElementById('notificationsToggle');
        if (notificationsToggle) {
            notificationsToggle.addEventListener('change', (e) => {
                this.userData.user.preferences.notifications = e.target.checked;
                this.showToast('Notification settings updated', 'success');
            });
        }

        // Reminder time
        const reminderTime = document.getElementById('reminderTime');
        if (reminderTime) {
            reminderTime.addEventListener('change', (e) => {
                this.userData.user.preferences.reminderTime = e.target.value;
                this.showToast('Reminder time updated', 'success');
            });
        }

        // Microphone test
        const micTestBtn = document.getElementById('micTestBtn');
        if (micTestBtn) {
            micTestBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.testMicrophone();
            });
        }

        console.log('✅ Settings listeners setup');
    }

    setupModalListeners() {
        // Modal close buttons
        document.querySelectorAll('.modal-close').forEach(closeBtn => {
            closeBtn.addEventListener('click', (e) => {
                e.preventDefault();
                const modal = e.target.closest('.modal');
                if (modal) {
                    this.hideModal(modal.id);
                }
            });
        });

        // Success modal get started button
        const getStartedBtn = document.getElementById('getStartedBtn');
        if (getStartedBtn) {
            getStartedBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.hideModal('successModal');
                this.showDashboard();
            });
        }

        // Close modals on backdrop click
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.hideModal(modal.id);
                }
            });
        });

        console.log('✅ Modal listeners setup');
    }

    setupUIListeners() {
        // Toast close
        const toastClose = document.querySelector('.toast-close');
        if (toastClose) {
            toastClose.addEventListener('click', () => this.hideToast());
        }

        // Scroll handler for nav
        window.addEventListener('scroll', () => this.handleScroll());
        
        // Resize handler
        window.addEventListener('resize', () => this.handleResize());
        
        // FAQ button
        const faqBtn = document.getElementById('faqBtn');
        if (faqBtn) {
            faqBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.showToast('FAQ section coming soon!', 'info');
            });
        }

        // Help link
        const helpLink = document.getElementById('helpLink');
        if (helpLink) {
            helpLink.addEventListener('click', (e) => {
                e.preventDefault();
                if (this.currentUser) {
                    this.showDashboardPage('help');
                } else {
                    this.showToast('Please sign up to access help features', 'info');
                }
            });
        }

        console.log('✅ UI listeners setup');
    }

    // Authentication Methods
    showAuth() {
        console.log('🔐 Showing authentication');
        
        const landingPage = document.getElementById('landingPage');
        const authContainer = document.getElementById('authContainer');
        
        if (landingPage && authContainer) {
            landingPage.classList.add('hidden');
            authContainer.classList.remove('hidden');
            this.showAuthForm('login');
            this.showToast('Welcome! Please sign in or create an account.', 'info');
        } else {
            console.error('❌ Auth containers not found');
        }
    }

    showAuthForm(type) {
        console.log(`Showing ${type} form`);
        
        document.querySelectorAll('.auth-form').forEach(form => form.classList.remove('active'));
        const targetForm = document.getElementById(`${type}Form`);
        
        if (targetForm) {
            targetForm.classList.add('active');
        }
    }

    checkPasswordStrength(password) {
        const strengthFill = document.querySelector('.strength-fill');
        const strengthText = document.querySelector('.strength-text span');
        
        if (!strengthFill || !strengthText) return;
        
        let strength = 0;
        let text = 'Enter password';
        let className = '';

        if (password.length >= 8) strength += 1;
        if (/[A-Z]/.test(password)) strength += 1;
        if (/[a-z]/.test(password)) strength += 1;
        if (/[0-9]/.test(password)) strength += 1;
        if (/[^A-Za-z0-9]/.test(password)) strength += 1;

        switch (strength) {
            case 0:
            case 1:
                text = 'Weak';
                className = 'weak';
                break;
            case 2:
                text = 'Fair';
                className = 'fair';
                break;
            case 3:
                text = 'Good';
                className = 'good';
                break;
            case 4:
            case 5:
                text = 'Strong';
                className = 'strong';
                break;
        }

        strengthFill.className = `strength-fill ${className}`;
        strengthText.textContent = text;
    }

    async handleLogin(e) {
        e.preventDefault();
        console.log('🔐 Handling login');
        
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        const loginBtn = document.getElementById('loginBtn');
        
        if (!email || !password) {
            this.showToast('Please enter both email and password', 'error');
            return;
        }
        
        // Show loading
        this.showButtonLoader(loginBtn, true);
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // For demo, accept any credentials
        this.currentUser = {
            ...this.userData.user,
            email: email
        };
        
        this.showButtonLoader(loginBtn, false);
        this.hideAuth();
        this.showDashboard();
        this.showToast(`Welcome back, ${this.currentUser.name}! 👋`, 'success');
    }

    async handleRegister(e) {
        e.preventDefault();
        console.log('🔐 Handling registration');
        
        const name = document.getElementById('registerName').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        const agreeTerms = document.getElementById('agreeTerms').checked;
        const registerBtn = document.getElementById('registerBtn');
        
        // Validate
        if (!this.validateRegistration(name, email, password, agreeTerms)) {
            return;
        }
        
        // Show loading
        this.showButtonLoader(registerBtn, true);
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Create user
        this.currentUser = {
            ...this.userData.user,
            name: name,
            email: email
        };
        
        this.showButtonLoader(registerBtn, false);
        this.hideAuth();
        this.showModal('successModal');
    }

    validateRegistration(name, email, password, agreeTerms) {
        let isValid = true;
        
        // Clear previous errors
        document.querySelectorAll('.form-error').forEach(error => error.classList.remove('show'));
        
        if (!name.trim()) {
            this.showFormError('registerNameError', 'Name is required');
            isValid = false;
        }
        
        if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
            this.showFormError('registerEmailError', 'Valid email is required');
            isValid = false;
        }
        
        if (!password || password.length < 8) {
            this.showFormError('registerPasswordError', 'Password must be at least 8 characters');
            isValid = false;
        }
        
        if (!agreeTerms) {
            this.showFormError('agreeTermsError', 'You must agree to the terms');
            isValid = false;
        }
        
        return isValid;
    }

    showFormError(errorId, message) {
        const errorEl = document.getElementById(errorId);
        if (errorEl) {
            errorEl.textContent = message;
            errorEl.classList.add('show');
        }
    }

    showButtonLoader(button, show) {
        const loader = button.querySelector('.btn-loader');
        const text = button.querySelector('.btn-text');
        
        if (show) {
            if (loader) loader.classList.add('show');
            button.disabled = true;
            if (text) text.style.opacity = '0.7';
        } else {
            if (loader) loader.classList.remove('show');
            button.disabled = false;
            if (text) text.style.opacity = '1';
        }
    }

    hideAuth() {
        const authContainer = document.getElementById('authContainer');
        if (authContainer) {
            authContainer.classList.add('hidden');
        }
    }

    logout() {
        console.log('🔐 Logging out');
        this.currentUser = null;
        
        const dashboardContainer = document.getElementById('dashboardContainer');
        const landingPage = document.getElementById('landingPage');
        
        if (dashboardContainer) dashboardContainer.classList.add('hidden');
        if (landingPage) landingPage.classList.remove('hidden');
        
        this.showToast('Logged out successfully', 'success');
    }

    // Dashboard Methods
    showDashboard() {
        console.log('📊 Showing dashboard');
        
        const authContainer = document.getElementById('authContainer');
        const landingPage = document.getElementById('landingPage');
        const dashboardContainer = document.getElementById('dashboardContainer');
        
        if (authContainer) authContainer.classList.add('hidden');
        if (landingPage) landingPage.classList.add('hidden');
        if (dashboardContainer) dashboardContainer.classList.remove('hidden');
        
        this.showDashboardPage('dashboard');
        this.updateUserInterface();
    }

    showDashboardPage(pageId) {
        console.log(`📄 Showing page: ${pageId}`);
        
        // Update navigation
        document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
        const navItem = document.querySelector(`[data-page="${pageId}"]`);
        if (navItem) navItem.classList.add('active');
        
        // Show page
        document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
        const targetPage = document.getElementById(`${pageId}Page`);
        if (targetPage) targetPage.classList.add('active');
        
        // Load page-specific data
        if (pageId === 'dashboard') {
            this.updateDashboardStats();
        } else if (pageId === 'practice') {
            this.loadPracticeOptions();
        }
        
        this.showToast(`Switched to ${pageId} page`, 'info');
    }

    updateUserInterface() {
        // Update user info in sidebar
        const userName = document.querySelector('.user-name');
        const userLevel = document.querySelector('.user-level');
        
        if (userName && this.currentUser) {
            userName.textContent = this.currentUser.name;
        }
        if (userLevel && this.currentUser) {
            userLevel.textContent = this.currentUser.isNewUser ? 'New Speaker' : 'Experienced Speaker';
        }
    }

    updateDashboardStats() {
        console.log('📈 Updating dashboard stats for new user');
        
        // Update all stats to show new user state (0 values)
        const statsValues = document.querySelectorAll('.stat-value');
        if (statsValues.length >= 4) {
            statsValues[0].textContent = '0'; // Sessions
            statsValues[1].textContent = '0%'; // Confidence
            statsValues[2].textContent = '0'; // Streak  
            statsValues[3].textContent = '0'; // Points
        }
        
        // Update progress rings to 0%
        document.querySelectorAll('.progress-foreground').forEach(ring => {
            ring.setAttribute('stroke-dasharray', '0, 100');
        });
        
        // Update level progress to 0%
        document.querySelectorAll('.level-progress .progress-fill').forEach(fill => {
            fill.style.width = '0%';
        });
    }

    // Practice Methods
    loadPracticeOptions() {
        console.log('🎤 Loading practice options');
        
        // Reset practice interface
        const practiceSession = document.getElementById('practiceSession');
        if (practiceSession) {
            practiceSession.classList.add('hidden');
        }
        
        // Reset selection
        document.querySelectorAll('.practice-type-card').forEach(card => {
            card.classList.remove('selected');
        });
    }

    showPracticeSession(type) {
        console.log(`🎤 Starting ${type} practice session`);
        
        const practiceSession = document.getElementById('practiceSession');
        if (practiceSession) {
            practiceSession.classList.remove('hidden');
        }
        
        // Update session title
        const sessionTitle = document.getElementById('sessionTitle');
        const typeNames = {
            freestyle: 'Freestyle Speaking',
            guided: 'Guided Practice',
            interview: 'Interview Simulation',
            presentation: 'Presentation Mode'
        };
        
        if (sessionTitle) {
            sessionTitle.textContent = typeNames[type] || 'Practice Session';
        }
        
        // Initialize waveform canvas
        this.initializeWaveform();
        this.showToast(`${typeNames[type]} session ready! Click "Start Recording" when ready.`, 'info');
    }

    startPracticeSession(level) {
        console.log(`🎯 Starting practice session for ${level} level`);
        
        this.showDashboardPage('practice');
        
        // Auto-select freestyle for quick start
        setTimeout(() => {
            const freestyleCard = document.querySelector('[data-type="freestyle"]');
            if (freestyleCard) {
                freestyleCard.click();
            }
        }, 500);
    }

    async startRecording() {
        console.log('🎤 Starting recording');
        
        try {
            // Request microphone access
            this.mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
            
            // Setup audio context
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const source = this.audioContext.createMediaStreamSource(this.mediaStream);
            this.analyser = this.audioContext.createAnalyser();
            source.connect(this.analyser);
            
            this.analyser.fftSize = 256;
            
            this.isRecording = true;
            this.updateRecordingUI();
            this.startConfidenceSimulation();
            this.startWaveformAnimation();
            
            this.showToast('Recording started! Speak confidently 🎤', 'success');
            
        } catch (error) {
            console.error('Error accessing microphone:', error);
            this.showToast('Could not access microphone. Please check permissions.', 'error');
        }
    }

    pauseRecording() {
        console.log('⏸️ Pausing recording');
        this.isRecording = false;
        this.updateRecordingUI();
        this.showToast('Recording paused', 'info');
    }

    resumeRecording() {
        console.log('▶️ Resuming recording');
        this.isRecording = true;
        this.updateRecordingUI();
        this.startConfidenceSimulation();
        this.startWaveformAnimation();
        this.showToast('Recording resumed', 'success');
    }

    endPracticeSession() {
        console.log('🛑 Ending practice session');
        
        // Stop recording
        if (this.mediaStream) {
            this.mediaStream.getTracks().forEach(track => track.stop());
        }
        if (this.audioContext) {
            this.audioContext.close();
        }
        
        this.isRecording = false;
        
        // Update user stats (simulate first session completion)
        if (this.userData.user.totalSessions === 0) {
            this.userData.user.totalSessions = 1;
            this.userData.user.confidenceScore = 15;
            this.updateDashboardStats();
            
            // Show achievement unlock
            this.showToast('🎉 Achievement Unlocked: First Steps! +10 points', 'success');
        }
        
        // Show results
        this.showSessionResults();
    }

    updateRecordingUI() {
        const recordBtn = document.getElementById('recordBtn');
        const pauseBtn = document.getElementById('pauseBtn');
        const resumeBtn = document.getElementById('resumeBtn');
        
        if (recordBtn && pauseBtn && resumeBtn) {
            if (this.isRecording) {
                recordBtn.classList.add('hidden');
                pauseBtn.classList.remove('hidden');
                resumeBtn.classList.add('hidden');
            } else if (this.mediaStream) {
                recordBtn.classList.add('hidden');
                pauseBtn.classList.add('hidden');
                resumeBtn.classList.remove('hidden');
            } else {
                recordBtn.classList.remove('hidden');
                pauseBtn.classList.add('hidden');
                resumeBtn.classList.add('hidden');
            }
        }
    }

    startConfidenceSimulation() {
        if (!this.isRecording) return;
        
        // Simulate confidence building over time
        const targetConfidence = Math.min(this.confidenceScore + Math.random() * 15 + 5, 85);
        const currentConfidence = this.confidenceScore;
        
        // Animate confidence meter
        const duration = 3000;
        const start = performance.now();
        
        const animate = (now) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            
            this.confidenceScore = currentConfidence + (targetConfidence - currentConfidence) * progress;
            this.updateConfidenceMeter(this.confidenceScore);
            
            if (progress < 1 && this.isRecording) {
                requestAnimationFrame(animate);
            } else if (this.isRecording) {
                // Schedule next update
                setTimeout(() => this.startConfidenceSimulation(), 2000);
            }
        };
        
        requestAnimationFrame(animate);
    }

    updateConfidenceMeter(confidence) {
        const meterValue = document.getElementById('liveConfidence');
        const confidenceFill = document.querySelector('.confidence-fill');
        
        if (meterValue) {
            meterValue.textContent = `${Math.round(confidence)}%`;
        }
        
        if (confidenceFill) {
            const circumference = 283; // 2 * π * 45
            const offset = circumference - (confidence / 100) * circumference;
            confidenceFill.style.strokeDashoffset = offset;
        }
        
        // Update feedback bars
        this.updateFeedbackBars(confidence);
        
        // Update transcript simulation
        this.updateTranscript();
    }

    updateFeedbackBars(confidence) {
        const feedbackBars = document.querySelectorAll('.feedback-fill');
        const values = [
            Math.min(confidence + Math.random() * 20, 100), // Voice clarity
            Math.min(confidence + Math.random() * 15, 95),  // Speaking pace
            confidence // Confidence
        ];
        
        feedbackBars.forEach((bar, index) => {
            if (values[index] !== undefined) {
                bar.style.width = `${values[index]}%`;
            }
        });
    }

    updateTranscript() {
        const transcriptDisplay = document.getElementById('transcriptDisplay');
        if (!transcriptDisplay || !this.isRecording) return;
        
        const samplePhrases = [
            "Hello, I'm excited to practice speaking...",
            "Confidence comes from practice and preparation...",
            "I can feel myself getting more comfortable...",
            "Speaking clearly and with purpose...",
            "My voice is strong and steady..."
        ];
        
        const randomPhrase = samplePhrases[Math.floor(Math.random() * samplePhrases.length)];
        transcriptDisplay.textContent = randomPhrase;
    }

    initializeWaveform() {
        const canvas = document.getElementById('waveformCanvas');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
        
        // Store canvas context for animation
        this.waveformCtx = ctx;
        this.waveformCanvas = canvas;
        
        console.log('🌊 Waveform initialized');
    }

    startWaveformAnimation() {
        if (!this.waveformCtx || !this.isRecording) return;
        
        const ctx = this.waveformCtx;
        const canvas = this.waveformCanvas;
        
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Get CSS color
        const computedStyle = getComputedStyle(document.documentElement);
        const primaryColor = computedStyle.getPropertyValue('--color-primary').trim();
        
        // Draw waveform
        ctx.strokeStyle = primaryColor || '#32a0a0';
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        const barWidth = canvas.width / 64;
        
        for (let i = 0; i < 64; i++) {
            const intensity = this.isRecording ? (Math.random() * 0.8 + 0.2) : 0.1;
            const barHeight = intensity * canvas.height;
            const x = i * barWidth;
            const y = (canvas.height - barHeight) / 2;
            
            ctx.moveTo(x, y);
            ctx.lineTo(x, y + barHeight);
        }
        
        ctx.stroke();
        
        // Continue animation
        if (this.isRecording) {
            requestAnimationFrame(() => this.startWaveformAnimation());
        }
    }

    showSessionResults() {
        // For now, just show a toast with results
        const score = Math.round(this.confidenceScore);
        this.showToast(`🎉 Session completed! Confidence score: ${score}%. Great progress!`, 'success');
        
        // Return to practice selection after a delay
        setTimeout(() => {
            this.loadPracticeOptions();
        }, 3000);
    }

    // Settings Methods
    async testMicrophone() {
        console.log('🎤 Testing microphone');
        
        const micTestBtn = document.getElementById('micTestBtn');
        if (!micTestBtn) return;
        
        const originalHTML = micTestBtn.innerHTML;
        
        try {
            micTestBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>Testing...</span>';
            micTestBtn.disabled = true;
            
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            
            // Test successful
            micTestBtn.innerHTML = '<i class="fas fa-check"></i><span>Microphone Working</span>';
            micTestBtn.style.borderColor = 'var(--color-success)';
            micTestBtn.style.color = 'var(--color-success)';
            
            // Stop test stream
            stream.getTracks().forEach(track => track.stop());
            
            this.showToast('Microphone test successful! 🎤', 'success');
            
        } catch (error) {
            console.error('Microphone test failed:', error);
            
            micTestBtn.innerHTML = '<i class="fas fa-exclamation-triangle"></i><span>Test Failed</span>';
            micTestBtn.style.borderColor = 'var(--color-error)';
            micTestBtn.style.color = 'var(--color-error)';
            
            this.showToast('Microphone test failed. Please check permissions.', 'error');
        }
        
        // Reset button after 3 seconds
        setTimeout(() => {
            micTestBtn.innerHTML = originalHTML;
            micTestBtn.style.borderColor = '';
            micTestBtn.style.color = '';
            micTestBtn.disabled = false;
        }, 3000);
    }

    // Three.js Methods
    initThreeJS() {
        const canvas = document.getElementById('threeCanvas');
        if (!canvas) return;

        try {
            // Scene setup
            this.scene = new THREE.Scene();
            
            // Camera
            this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
            this.camera.position.z = 5;

            // Renderer
            this.renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
            this.renderer.setSize(window.innerWidth, window.innerHeight);
            this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

            // Add lights
            const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
            this.scene.add(ambientLight);

            const directionalLight = new THREE.DirectionalLight(0x32a0a0, 0.8);
            directionalLight.position.set(1, 1, 1);
            this.scene.add(directionalLight);

            // Create particles
            this.createParticles();
            
            // Start animation loop
            this.animate();
            
            console.log('✅ Three.js initialized');
        } catch (error) {
            console.warn('Three.js initialization failed:', error);
        }
    }

    createParticles() {
        try {
            const particleCount = 100;
            const geometry = new THREE.BufferGeometry();
            const positions = new Float32Array(particleCount * 3);
            const colors = new Float32Array(particleCount * 3);

            for (let i = 0; i < particleCount; i++) {
                const i3 = i * 3;
                
                positions[i3] = (Math.random() - 0.5) * 10;
                positions[i3 + 1] = (Math.random() - 0.5) * 10;
                positions[i3 + 2] = (Math.random() - 0.5) * 10;
                
                colors[i3] = Math.random() * 0.5 + 0.5;
                colors[i3 + 1] = Math.random() * 0.8 + 0.2;
                colors[i3 + 2] = Math.random() * 0.8 + 0.2;
            }

            geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
            geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

            const material = new THREE.PointsMaterial({
                size: 0.1,
                vertexColors: true,
                transparent: true,
                opacity: 0.8
            });

            this.particles = new THREE.Points(geometry, material);
            this.scene.add(this.particles);
        } catch (error) {
            console.warn('Particle creation failed:', error);
        }
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        
        try {
            if (this.particles) {
                this.particles.rotation.x += 0.001;
                this.particles.rotation.y += 0.002;
            }
            
            if (this.renderer && this.scene && this.camera) {
                this.renderer.render(this.scene, this.camera);
            }
        } catch (error) {
            // Silently handle animation errors
        }
    }

    // Animation and UI Methods
    setupAnimations() {
        // Only setup if GSAP is available
        if (typeof gsap === 'undefined') {
            console.warn('GSAP not available, skipping animations');
            return;
        }

        try {
            // Register GSAP plugins
            if (gsap.registerPlugin) {
                gsap.registerPlugin(ScrollTrigger);
            }
            
            // Setup scroll animations
            this.setupScrollAnimations();
            
            console.log('✅ Animations setup');
        } catch (error) {
            console.warn('Animation setup failed:', error);
        }
    }

    setupScrollAnimations() {
        if (typeof gsap === 'undefined') return;

        try {
            // Hero animations with delay to ensure elements are loaded
            setTimeout(() => {
                const titleWords = document.querySelectorAll('.title-word');
                if (titleWords.length > 0) {
                    gsap.from(titleWords, {
                        duration: 1.2,
                        y: 100,
                        opacity: 0,
                        stagger: 0.2,
                        ease: "power3.out",
                        delay: 0.5
                    });
                }

                const subtitle = document.querySelector('.hero-subtitle');
                if (subtitle) {
                    gsap.from(subtitle, {
                        duration: 0.8,
                        y: 50,
                        opacity: 0,
                        ease: "power2.out",
                        delay: 1
                    });
                }

                const stats = document.querySelectorAll('.stat');
                if (stats.length > 0) {
                    gsap.from(stats, {
                        duration: 0.6,
                        y: 30,
                        opacity: 0,
                        stagger: 0.1,
                        ease: "back.out(1.7)",
                        delay: 1.2
                    });
                }
            }, 100);

        } catch (error) {
            console.warn('Scroll animations setup failed:', error);
        }
    }

    smoothScrollTo(target) {
        const element = document.querySelector(target);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    }

    // Utility Methods
    showModal(modalId) {
        console.log(`📱 Showing modal: ${modalId}`);
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('hidden');
        }
    }

    hideModal(modalId) {
        console.log(`📱 Hiding modal: ${modalId}`);
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('hidden');
        }
    }

    showToast(message, type = 'info') {
        const toast = document.getElementById('toast');
        const toastMessage = document.querySelector('.toast-message');
        const toastIcon = document.querySelector('.toast-icon i');
        
        if (toast && toastMessage) {
            // Set message
            toastMessage.textContent = message;
            
            // Set icon based on type
            if (toastIcon) {
                const icons = {
                    success: 'fa-check-circle',
                    error: 'fa-exclamation-circle',
                    warning: 'fa-exclamation-triangle',
                    info: 'fa-info-circle'
                };
                
                toastIcon.className = `fas ${icons[type] || icons.info}`;
            }
            
            // Show toast
            toast.classList.remove('hidden');
            
            // Auto-hide after 4 seconds
            setTimeout(() => this.hideToast(), 4000);
        }
        
        console.log(`🔔 Toast: ${message}`);
    }

    hideToast() {
        const toast = document.getElementById('toast');
        if (toast) {
            toast.classList.add('hidden');
        }
    }

    handleScroll() {
        const nav = document.querySelector('.nav-header');
        
        if (nav) {
            if (window.scrollY > 100) {
                nav.classList.add('scrolled');
            } else {
                nav.classList.remove('scrolled');
            }
        }
    }

    handleResize() {
        if (this.camera && this.renderer) {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        }
        
        // Resize waveform canvas
        const canvas = document.getElementById('waveformCanvas');
        if (canvas && this.waveformCtx) {
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
        }
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('🎤 DOM loaded, starting SpeakAI Application...');
    
    // Create app instance with small delay to ensure DOM is fully ready
    setTimeout(() => {
        window.speakAIApp = new SpeakAIApp();
        window.speakAIApp.init();
    }, 100);
});

// Handle page visibility changes for recording
document.addEventListener('visibilitychange', () => {
    if (document.hidden && window.speakAIApp && window.speakAIApp.isRecording) {
        window.speakAIApp.pauseRecording();
        window.speakAIApp.showToast('Recording paused due to tab switch', 'info');
    }
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (!window.speakAIApp) return;
    
    if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
            case ',':
                e.preventDefault();
                if (window.speakAIApp.currentUser) {
                    window.speakAIApp.showDashboardPage('settings');
                }
                break;
            case 'h':
                e.preventDefault();
                if (window.speakAIApp.currentUser) {
                    window.speakAIApp.showDashboardPage('help');
                }
                break;
        }
    }
    
    // ESC to close modals
    if (e.key === 'Escape') {
        document.querySelectorAll('.modal:not(.hidden)').forEach(modal => {
            window.speakAIApp.hideModal(modal.id);
        });
    }
});

// Add landing page wave animation
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        const waveform = document.querySelector('.waveform');
        if (waveform) {
            const bars = waveform.querySelectorAll('.wave-bar');
            
            const animateWaves = () => {
                bars.forEach((bar, index) => {
                    const height = Math.random() * 60 + 20;
                    bar.style.height = `${height}%`;
                    bar.style.transition = 'height 0.3s ease';
                });
            };
            
            // Start animation
            setInterval(animateWaves, 800);
        }
    }, 1000);
});

console.log('🎉 SpeakAI Premium Platform Script Loaded Successfully!');