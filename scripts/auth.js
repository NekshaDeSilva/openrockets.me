// Authentication Modal and Forms
document.addEventListener('DOMContentLoaded', function() {
    createAuthModals();
    setupAuthForms();
});

function createAuthModals() {
    const authModalsHTML = `
        <!-- Login Modal -->
        <div id="loginModal" class="auth-modal">
            <div class="modal-content auth-modal-content">
                <div class="modal-header">
                    <h2><i class="fas fa-sign-in-alt"></i> Welcome Back</h2>
                    <button class="close-modal" onclick="closeAuthModal('loginModal')">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <form id="loginForm" class="auth-form">
                    <div class="form-group">
                        <label for="loginEmail">Email Address</label>
                        <div class="input-group">
                            <i class="fas fa-envelope"></i>
                            <input type="email" id="loginEmail" name="email" required placeholder="Enter your email">
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="loginPassword">Password</label>
                        <div class="input-group">
                            <i class="fas fa-lock"></i>
                            <input type="password" id="loginPassword" name="password" required placeholder="Enter your password">
                            <button type="button" class="toggle-password" onclick="togglePassword('loginPassword')">
                                <i class="fas fa-eye"></i>
                            </button>
                        </div>
                    </div>
                    <div class="form-options">
                        <label class="checkbox-container">
                            <input type="checkbox" id="rememberMe" name="rememberMe">
                            <span class="checkmark"></span>
                            Remember me
                        </label>
                        <a href="#" class="forgot-password">Forgot Password?</a>
                    </div>
                    <button type="submit" class="auth-submit-btn">
                        <i class="fas fa-sign-in-alt"></i>
                        <span>Sign In</span>
                    </button>
                    <div class="auth-divider">
                        <span>Don't have an account?</span>
                    </div>
                    <button type="button" class="auth-switch-btn" onclick="switchAuthModal('registerModal')">
                        Create Account
                    </button>
                </form>
            </div>
        </div>

        <!-- Register Modal -->
        <div id="registerModal" class="auth-modal">
            <div class="modal-content auth-modal-content">
                <div class="modal-header">
                    <h2><i class="fas fa-user-plus"></i> Join OpenRockets</h2>
                    <button class="close-modal" onclick="closeAuthModal('registerModal')">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <form id="registerForm" class="auth-form">
                    <div class="form-group">
                        <label for="registerFullName">Full Name</label>
                        <div class="input-group">
                            <i class="fas fa-user"></i>
                            <input type="text" id="registerFullName" name="fullName" required placeholder="Enter your full name">
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="registerUsername">Username</label>
                        <div class="input-group">
                            <i class="fas fa-at"></i>
                            <input type="text" id="registerUsername" name="username" required placeholder="Choose a username">
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="registerEmail">Email Address</label>
                        <div class="input-group">
                            <i class="fas fa-envelope"></i>
                            <input type="email" id="registerEmail" name="email" required placeholder="Enter your email">
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="registerPassword">Password</label>
                        <div class="input-group">
                            <i class="fas fa-lock"></i>
                            <input type="password" id="registerPassword" name="password" required placeholder="Create a password">
                            <button type="button" class="toggle-password" onclick="togglePassword('registerPassword')">
                                <i class="fas fa-eye"></i>
                            </button>
                        </div>
                        <div class="password-strength">
                            <div class="strength-bar"></div>
                            <span class="strength-text">Enter a password</span>
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="confirmPassword">Confirm Password</label>
                        <div class="input-group">
                            <i class="fas fa-lock"></i>
                            <input type="password" id="confirmPassword" name="confirmPassword" required placeholder="Confirm your password">
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="userType">I am a:</label>
                        <div class="radio-group">
                            <label class="radio-container">
                                <input type="radio" name="userType" value="student" checked>
                                <span class="radio-mark"></span>
                                <div class="radio-content">
                                    <i class="fas fa-graduation-cap"></i>
                                    <span>Student Learner</span>
                                </div>
                            </label>
                            <label class="radio-container">
                                <input type="radio" name="userType" value="instructor">
                                <span class="radio-mark"></span>
                                <div class="radio-content">
                                    <i class="fas fa-chalkboard-teacher"></i>
                                    <span>Student Lecturer</span>
                                </div>
                            </label>
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="profileImageUpload">Profile Picture (Optional)</label>
                        <div class="file-upload-container">
                            <input type="file" id="profileImageUpload" name="profileImage" accept="image/*" style="display: none;">
                            <button type="button" class="file-upload-btn" onclick="document.getElementById('profileImageUpload').click()">
                                <i class="fas fa-camera"></i>
                                <span>Choose Image</span>
                            </button>
                            <div class="file-preview" id="profileImagePreview" style="display: none;">
                                <img src="" alt="Profile Preview">
                                <button type="button" class="remove-file" onclick="removeProfileImage()">
                                    <i class="fas fa-times"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="checkbox-container">
                            <input type="checkbox" id="agreeTerms" name="agreeTerms" required>
                            <span class="checkmark"></span>
                            I agree to the <a href="#" target="_blank">Terms of Service</a> and <a href="#" target="_blank">Privacy Policy</a>
                        </label>
                    </div>
                    <button type="submit" class="auth-submit-btn">
                        <i class="fas fa-user-plus"></i>
                        <span>Create Account</span>
                    </button>
                    <div class="auth-divider">
                        <span>Already have an account?</span>
                    </div>
                    <button type="button" class="auth-switch-btn" onclick="switchAuthModal('loginModal')">
                        Sign In Instead
                    </button>
                </form>
            </div>
        </div>

        <!-- Profile Modal -->
        <div id="profileModal" class="auth-modal">
            <div class="modal-content auth-modal-content">
                <div class="modal-header">
                    <h2><i class="fas fa-user-edit"></i> Edit Profile</h2>
                    <button class="close-modal" onclick="closeAuthModal('profileModal')">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <form id="profileForm" class="auth-form">
                    <div class="profile-image-section">
                        <div class="current-profile-image">
                            <img id="currentProfileImage" src="" alt="Current Profile">
                            <div class="image-overlay">
                                <button type="button" onclick="document.getElementById('profileImageUpdate').click()">
                                    <i class="fas fa-camera"></i>
                                </button>
                            </div>
                        </div>
                        <input type="file" id="profileImageUpdate" accept="image/*" style="display: none;">
                    </div>
                    <div class="form-group">
                        <label for="profileFullName">Full Name</label>
                        <div class="input-group">
                            <i class="fas fa-user"></i>
                            <input type="text" id="profileFullName" name="fullName" required>
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="profileBio">Bio</label>
                        <div class="input-group">
                            <i class="fas fa-quote-left"></i>
                            <textarea id="profileBio" name="bio" rows="3" placeholder="Tell us about yourself..."></textarea>
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="profileSkills">Skills (comma-separated)</label>
                        <div class="input-group">
                            <i class="fas fa-code"></i>
                            <input type="text" id="profileSkills" name="skills" placeholder="JavaScript, Python, React...">
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="profileStatus">Status</label>
                        <div class="input-group">
                            <i class="fas fa-circle"></i>
                            <select id="profileStatus" name="status">
                                <option value="active">🟢 Active</option>
                                <option value="busy">🟡 Busy</option>
                                <option value="away">🔴 Away</option>
                                <option value="studying">📚 Studying</option>
                                <option value="coding">💻 Coding</option>
                            </select>
                        </div>
                    </div>
                    <div class="form-actions">
                        <button type="button" class="btn-secondary" onclick="closeAuthModal('profileModal')">
                            Cancel
                        </button>
                        <button type="submit" class="auth-submit-btn">
                            <i class="fas fa-save"></i>
                            <span>Save Changes</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;

    // Add modals to body
    document.body.insertAdjacentHTML('beforeend', authModalsHTML);

    // Add auth modal styles
    const authStyles = `
        <style>
        .auth-modal {
            display: none;
            position: fixed;
            z-index: 10000;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            backdrop-filter: blur(5px);
            opacity: 0;
            transition: opacity 0.3s ease;
        }

        .auth-modal.show {
            display: flex;
            opacity: 1;
            align-items: center;
            justify-content: center;
        }

        .auth-modal-content {
            background: var(--bg-secondary);
            border-radius: 16px;
            max-width: 500px;
            width: 90%;
            max-height: 90vh;
            overflow-y: auto;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
            transform: translateY(50px);
            transition: transform 0.3s ease;
        }

        .auth-modal.show .auth-modal-content {
            transform: translateY(0);
        }

        .modal-header {
            padding: 24px 24px 0;
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 24px;
        }

        .modal-header h2 {
            color: var(--text-primary);
            font-size: 1.5rem;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 12px;
            margin: 0;
        }

        .close-modal {
            background: none;
            border: none;
            color: var(--text-secondary);
            font-size: 1.2rem;
            cursor: pointer;
            padding: 8px;
            border-radius: 8px;
            transition: all 0.2s ease;
        }

        .close-modal:hover {
            background: var(--bg-tertiary);
            color: var(--text-primary);
        }

        .auth-form {
            padding: 0 24px 24px;
        }

        .form-group {
            margin-bottom: 20px;
        }

        .form-group label {
            display: block;
            color: var(--text-primary);
            font-weight: 500;
            margin-bottom: 8px;
        }

        .input-group {
            position: relative;
            display: flex;
            align-items: center;
        }

        .input-group i {
            position: absolute;
            left: 12px;
            color: var(--text-secondary);
            z-index: 1;
        }

        .input-group input,
        .input-group textarea,
        .input-group select {
            width: 100%;
            padding: 12px 12px 12px 40px;
            background: var(--bg-tertiary);
            border: 2px solid transparent;
            border-radius: 8px;
            color: var(--text-primary);
            font-size: 1rem;
            transition: all 0.2s ease;
        }

        .input-group input:focus,
        .input-group textarea:focus,
        .input-group select:focus {
            outline: none;
            border-color: var(--accent-primary);
            background: var(--bg-primary);
        }

        .input-group textarea {
            resize: vertical;
            min-height: 80px;
        }

        .toggle-password {
            position: absolute;
            right: 12px;
            background: none;
            border: none;
            color: var(--text-secondary);
            cursor: pointer;
            padding: 4px;
            border-radius: 4px;
            transition: color 0.2s ease;
        }

        .toggle-password:hover {
            color: var(--text-primary);
        }

        .password-strength {
            margin-top: 8px;
        }

        .strength-bar {
            height: 4px;
            background: var(--bg-tertiary);
            border-radius: 2px;
            overflow: hidden;
            margin-bottom: 4px;
        }

        .strength-bar::after {
            content: '';
            display: block;
            height: 100%;
            width: 0;
            background: #ff4444;
            transition: all 0.3s ease;
        }

        .strength-bar.weak::after {
            width: 33%;
            background: #ff4444;
        }

        .strength-bar.medium::after {
            width: 66%;
            background: #ffaa00;
        }

        .strength-bar.strong::after {
            width: 100%;
            background: #00aa44;
        }

        .strength-text {
            font-size: 0.85rem;
            color: var(--text-secondary);
        }

        .radio-group {
            display: grid;
            gap: 12px;
        }

        .radio-container {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 12px;
            background: var(--bg-tertiary);
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.2s ease;
            border: 2px solid transparent;
        }

        .radio-container:hover {
            background: var(--bg-primary);
        }

        .radio-container input:checked + .radio-mark + .radio-content {
            color: var(--accent-primary);
        }

        .radio-container input:checked ~ .radio-container {
            border-color: var(--accent-primary);
        }

        .radio-mark {
            width: 20px;
            height: 20px;
            border: 2px solid var(--border-color);
            border-radius: 50%;
            position: relative;
            transition: all 0.2s ease;
        }

        .radio-container input:checked + .radio-mark {
            border-color: var(--accent-primary);
        }

        .radio-container input:checked + .radio-mark::after {
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 8px;
            height: 8px;
            background: var(--accent-primary);
            border-radius: 50%;
        }

        .radio-content {
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .radio-container input {
            display: none;
        }

        .checkbox-container {
            display: flex;
            align-items: flex-start;
            gap: 12px;
            cursor: pointer;
            line-height: 1.5;
        }

        .checkbox-container input {
            display: none;
        }

        .checkmark {
            width: 20px;
            height: 20px;
            background: var(--bg-tertiary);
            border: 2px solid var(--border-color);
            border-radius: 4px;
            position: relative;
            transition: all 0.2s ease;
            flex-shrink: 0;
            margin-top: 2px;
        }

        .checkbox-container input:checked + .checkmark {
            background: var(--accent-primary);
            border-color: var(--accent-primary);
        }

        .checkbox-container input:checked + .checkmark::after {
            content: '✓';
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            color: white;
            font-size: 0.8rem;
            font-weight: bold;
        }

        .form-options {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 24px;
        }

        .forgot-password {
            color: var(--accent-primary);
            text-decoration: none;
            font-size: 0.9rem;
            transition: opacity 0.2s ease;
        }

        .forgot-password:hover {
            opacity: 0.8;
        }

        .auth-submit-btn {
            width: 100%;
            padding: 14px;
            background: var(--accent-primary);
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            margin-bottom: 16px;
        }

        .auth-submit-btn:hover {
            background: var(--accent-hover);
            transform: translateY(-1px);
        }

        .auth-submit-btn:disabled {
            background: var(--text-secondary);
            cursor: not-allowed;
            transform: none;
        }

        .auth-divider {
            text-align: center;
            margin: 16px 0;
            position: relative;
        }

        .auth-divider::before {
            content: '';
            position: absolute;
            top: 50%;
            left: 0;
            right: 0;
            height: 1px;
            background: var(--border-color);
        }

        .auth-divider span {
            background: var(--bg-secondary);
            padding: 0 16px;
            color: var(--text-secondary);
            font-size: 0.9rem;
        }

        .auth-switch-btn {
            width: 100%;
            padding: 12px;
            background: transparent;
            color: var(--accent-primary);
            border: 2px solid var(--accent-primary);
            border-radius: 8px;
            font-size: 1rem;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s ease;
        }

        .auth-switch-btn:hover {
            background: var(--accent-primary);
            color: white;
        }

        .file-upload-container {
            display: flex;
            flex-direction: column;
            gap: 12px;
        }

        .file-upload-btn {
            padding: 12px;
            background: var(--bg-tertiary);
            border: 2px dashed var(--border-color);
            border-radius: 8px;
            color: var(--text-secondary);
            cursor: pointer;
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
        }

        .file-upload-btn:hover {
            border-color: var(--accent-primary);
            color: var(--accent-primary);
        }

        .file-preview {
            position: relative;
            max-width: 120px;
        }

        .file-preview img {
            width: 100%;
            height: 120px;
            object-fit: cover;
            border-radius: 8px;
        }

        .remove-file {
            position: absolute;
            top: -8px;
            right: -8px;
            width: 24px;
            height: 24px;
            background: var(--error-color);
            color: white;
            border: none;
            border-radius: 50%;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 0.8rem;
        }

        .profile-image-section {
            text-align: center;
            margin-bottom: 24px;
        }

        .current-profile-image {
            position: relative;
            width: 120px;
            height: 120px;
            margin: 0 auto;
            border-radius: 50%;
            overflow: hidden;
            background: var(--bg-tertiary);
        }

        .current-profile-image img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        .image-overlay {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0;
            transition: opacity 0.2s ease;
        }

        .current-profile-image:hover .image-overlay {
            opacity: 1;
        }

        .image-overlay button {
            background: var(--accent-primary);
            color: white;
            border: none;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .form-actions {
            display: flex;
            gap: 12px;
            margin-top: 24px;
        }

        .btn-secondary {
            flex: 1;
            padding: 12px;
            background: var(--bg-tertiary);
            color: var(--text-primary);
            border: 2px solid var(--border-color);
            border-radius: 8px;
            font-size: 1rem;
            cursor: pointer;
            transition: all 0.2s ease;
        }

        .btn-secondary:hover {
            background: var(--bg-primary);
        }

        @media (max-width: 768px) {
            .auth-modal-content {
                width: 95%;
                margin: 20px;
            }
            
            .modal-header {
                padding: 20px 20px 0;
            }
            
            .auth-form {
                padding: 0 20px 20px;
            }
        }
        </style>
    `;

    document.head.insertAdjacentHTML('beforeend', authStyles);
}

function setupAuthForms() {
    // Login form handler
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const email = formData.get('email');
        const password = formData.get('password');
        
        const submitBtn = e.target.querySelector('.auth-submit-btn');
        const originalText = submitBtn.innerHTML;
        
        try {
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>Signing In...</span>';
            submitBtn.disabled = true;
            
            await api.login(email, password);
            
            api.showNotification('Welcome back!', 'success');
            closeAuthModal('loginModal');
            
            // Redirect to dashboard
            window.location.href = '/dashboard';
            
        } catch (error) {
            api.showNotification(error.message, 'error');
        } finally {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    });

    // Register form handler
    document.getElementById('registerForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const password = formData.get('password');
        const confirmPassword = formData.get('confirmPassword');
        
        // Validate passwords match
        if (password !== confirmPassword) {
            api.showNotification('Passwords do not match', 'error');
            return;
        }
        
        // Validate password strength
        if (!api.validatePassword(password)) {
            api.showNotification('Password must be at least 6 characters long', 'error');
            return;
        }
        
        const submitBtn = e.target.querySelector('.auth-submit-btn');
        const originalText = submitBtn.innerHTML;
        
        try {
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>Creating Account...</span>';
            submitBtn.disabled = true;
            
            const userData = {
                fullName: formData.get('fullName'),
                username: formData.get('username'),
                email: formData.get('email'),
                password: formData.get('password'),
                userType: formData.get('userType'),
                bio: '',
                skills: ''
            };
            
            const profileImage = formData.get('profileImage');
            
            await api.register(userData, profileImage);
            
            api.showNotification('Account created successfully! Welcome to OpenRockets!', 'success');
            closeAuthModal('registerModal');
            
            // Redirect to dashboard
            window.location.href = '/dashboard';
            
        } catch (error) {
            api.showNotification(error.message, 'error');
        } finally {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    });

    // Profile form handler
    document.getElementById('profileForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const submitBtn = e.target.querySelector('.auth-submit-btn');
        const originalText = submitBtn.innerHTML;
        
        try {
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>Saving...</span>';
            submitBtn.disabled = true;
            
            const profileData = {
                fullName: formData.get('fullName'),
                bio: formData.get('bio'),
                skills: formData.get('skills'),
                status: formData.get('status')
            };
            
            const profileImage = document.getElementById('profileImageUpdate').files[0];
            
            await api.updateProfile(profileData, profileImage);
            
            // Update current user data
            const updatedProfile = await api.getProfile();
            api.setCurrentUser(updatedProfile.user);
            
            api.showNotification('Profile updated successfully!', 'success');
            closeAuthModal('profileModal');
            
            // Update UI
            updateAuthUI();
            
        } catch (error) {
            api.showNotification(error.message, 'error');
        } finally {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    });

    // Password strength checker
    document.getElementById('registerPassword').addEventListener('input', (e) => {
        checkPasswordStrength(e.target.value);
    });

    // Profile image upload handlers
    document.getElementById('profileImageUpload').addEventListener('change', (e) => {
        handleProfileImageUpload(e, 'profileImagePreview');
    });

    document.getElementById('profileImageUpdate').addEventListener('change', (e) => {
        handleProfileImageUpdate(e);
    });
}

function checkPasswordStrength(password) {
    const strengthBar = document.querySelector('.strength-bar');
    const strengthText = document.querySelector('.strength-text');
    
    let strength = 0;
    let text = 'Weak';
    
    if (password.length >= 6) strength++;
    if (password.match(/[a-z]/)) strength++;
    if (password.match(/[A-Z]/)) strength++;
    if (password.match(/[0-9]/)) strength++;
    if (password.match(/[^a-zA-Z0-9]/)) strength++;
    
    strengthBar.className = 'strength-bar';
    
    if (strength >= 4) {
        strengthBar.classList.add('strong');
        text = 'Strong';
    } else if (strength >= 2) {
        strengthBar.classList.add('medium');
        text = 'Medium';
    } else if (strength >= 1) {
        strengthBar.classList.add('weak');
        text = 'Weak';
    }
    
    strengthText.textContent = password.length === 0 ? 'Enter a password' : text;
}

function handleProfileImageUpload(event, previewId) {
    const file = event.target.files[0];
    const preview = document.getElementById(previewId);
    
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            preview.querySelector('img').src = e.target.result;
            preview.style.display = 'block';
        };
        reader.readAsDataURL(file);
    }
}

function handleProfileImageUpdate(event) {
    const file = event.target.files[0];
    const currentImage = document.getElementById('currentProfileImage');
    
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            currentImage.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
}

function removeProfileImage() {
    document.getElementById('profileImageUpload').value = '';
    document.getElementById('profileImagePreview').style.display = 'none';
}

function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const button = input.parentElement.querySelector('.toggle-password i');
    
    if (input.type === 'password') {
        input.type = 'text';
        button.className = 'fas fa-eye-slash';
    } else {
        input.type = 'password';
        button.className = 'fas fa-eye';
    }
}

function openAuthModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
    
    // Load profile data if opening profile modal
    if (modalId === 'profileModal' && api.isAuthenticated()) {
        loadProfileData();
    }
}

function closeAuthModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.remove('show');
    document.body.style.overflow = '';
    
    // Reset forms
    const form = modal.querySelector('form');
    if (form) {
        form.reset();
        
        // Reset password strength indicator
        const strengthBar = modal.querySelector('.strength-bar');
        const strengthText = modal.querySelector('.strength-text');
        if (strengthBar) {
            strengthBar.className = 'strength-bar';
            strengthText.textContent = 'Enter a password';
        }
        
        // Hide file previews
        const previews = modal.querySelectorAll('.file-preview');
        previews.forEach(preview => preview.style.display = 'none');
    }
}

function switchAuthModal(targetModalId) {
    // Close all auth modals
    document.querySelectorAll('.auth-modal').forEach(modal => {
        modal.classList.remove('show');
    });
    
    // Open target modal after a short delay
    setTimeout(() => {
        openAuthModal(targetModalId);
    }, 300);
}

async function loadProfileData() {
    if (!api.isAuthenticated()) return;
    
    try {
        const response = await api.getProfile();
        const user = response.user;
        
        // Populate form fields
        document.getElementById('profileFullName').value = user.fullName || '';
        document.getElementById('profileBio').value = user.bio || '';
        document.getElementById('profileSkills').value = user.skills ? user.skills.join(', ') : '';
        document.getElementById('profileStatus').value = user.status || 'active';
        
        // Set profile image
        const currentImage = document.getElementById('currentProfileImage');
        if (user.profileImage) {
            currentImage.src = user.profileImage;
        } else {
            // Use default avatar with initials
            const initials = api.getAvatarInitials(user.fullName || user.username);
            currentImage.src = `data:image/svg+xml,${encodeURIComponent(`
                <svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120">
                    <rect width="120" height="120" fill="#6366f1"/>
                    <text x="60" y="60" font-family="Arial" font-size="36" font-weight="bold" 
                          text-anchor="middle" dominant-baseline="central" fill="white">${initials}</text>
                </svg>
            `)}`;
        }
        
    } catch (error) {
        console.error('Failed to load profile data:', error);
        api.showNotification('Failed to load profile data', 'error');
    }
}

// Global functions for HTML onclick handlers
function showLoginModal() {
    openAuthModal('loginModal');
}

function showRegisterModal() {
    openAuthModal('registerModal');
}

function showProfileModal() {
    openAuthModal('profileModal');
}

// Close modals when clicking outside
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('auth-modal')) {
        e.target.classList.remove('show');
        document.body.style.overflow = '';
    }
});

// Close modals with Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        document.querySelectorAll('.auth-modal.show').forEach(modal => {
            modal.classList.remove('show');
            document.body.style.overflow = '';
        });
    }
});
