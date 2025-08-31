// API Configuration and Helper Functions
class OpenRocketsAPI {
    constructor() {
        this.baseURL = window.location.origin;
        this.token = localStorage.getItem('authToken');
        this.currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
    }

    // Set authentication token
    setToken(token) {
        this.token = token;
        localStorage.setItem('authToken', token);
    }

    // Remove authentication token
    removeToken() {
        this.token = null;
        localStorage.removeItem('authToken');
        localStorage.removeItem('currentUser');
    }

    // Set current user
    setCurrentUser(user) {
        this.currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(user));
    }

    // Get authorization headers
    getAuthHeaders() {
        const headers = {
            'Content-Type': 'application/json'
        };
        
        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }
        
        return headers;
    }

    // Make authenticated API request
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            headers: this.getAuthHeaders(),
            ...options
        };

        try {
            const response = await fetch(url, config);
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `HTTP ${response.status}`);
            }

            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                return await response.json();
            }
            
            return await response.text();
        } catch (error) {
            console.error('API Request Error:', error);
            throw error;
        }
    }

    // Authentication methods
    async register(userData, profileImage = null) {
        const formData = new FormData();
        
        Object.keys(userData).forEach(key => {
            formData.append(key, userData[key]);
        });
        
        if (profileImage) {
            formData.append('profileImage', profileImage);
        }

        const response = await fetch(`${this.baseURL}/api/auth/register`, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Registration failed');
        }

        const data = await response.json();
        this.setToken(data.token);
        this.setCurrentUser(data.user);
        
        return data;
    }

    async login(email, password) {
        const response = await this.request('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });

        this.setToken(response.token);
        this.setCurrentUser(response.user);
        
        return response;
    }

    async logout() {
        this.removeToken();
        window.location.href = '/';
    }

    async getProfile() {
        return await this.request('/api/auth/profile');
    }

    async updateProfile(profileData, profileImage = null) {
        const formData = new FormData();
        
        Object.keys(profileData).forEach(key => {
            if (profileData[key] !== undefined && profileData[key] !== null) {
                formData.append(key, profileData[key]);
            }
        });
        
        if (profileImage) {
            formData.append('profileImage', profileImage);
        }

        const response = await fetch(`${this.baseURL}/api/auth/profile`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${this.token}`
            },
            body: formData
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Profile update failed');
        }

        return await response.json();
    }

    // Posts methods
    async createPost(postData, images = []) {
        const formData = new FormData();
        
        Object.keys(postData).forEach(key => {
            formData.append(key, postData[key]);
        });
        
        images.forEach((image, index) => {
            formData.append('images', image);
        });

        const response = await fetch(`${this.baseURL}/api/posts`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.token}`
            },
            body: formData
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Post creation failed');
        }

        return await response.json();
    }

    async getPosts(filters = {}) {
        const params = new URLSearchParams(filters);
        return await this.request(`/api/posts?${params}`);
    }

    async getPost(postId) {
        return await this.request(`/api/posts/${postId}`);
    }

    async likePost(postId) {
        return await this.request(`/api/posts/${postId}/like`, {
            method: 'POST'
        });
    }

    async addComment(postId, content) {
        return await this.request(`/api/posts/${postId}/comments`, {
            method: 'POST',
            body: JSON.stringify({ content })
        });
    }

    async getComments(postId) {
        return await this.request(`/api/posts/${postId}/comments`);
    }

    // Events methods
    async createEvent(eventData) {
        return await this.request('/api/events', {
            method: 'POST',
            body: JSON.stringify(eventData)
        });
    }

    async getEvents(filters = {}) {
        const params = new URLSearchParams(filters);
        return await this.request(`/api/events?${params}`);
    }

    async joinEvent(eventId) {
        return await this.request(`/api/events/${eventId}/join`, {
            method: 'POST'
        });
    }

    // Messages methods
    async sendMessage(recipientId, content, type = 'text') {
        return await this.request('/api/messages', {
            method: 'POST',
            body: JSON.stringify({ recipientId, content, type })
        });
    }

    async getMessages(userId) {
        return await this.request(`/api/messages/${userId}`);
    }

    // Notifications methods
    async getNotifications() {
        return await this.request('/api/notifications');
    }

    async markNotificationRead(notificationId) {
        return await this.request(`/api/notifications/${notificationId}/read`, {
            method: 'PATCH'
        });
    }

    // Search methods
    async search(query, type = 'all') {
        const params = new URLSearchParams({ q: query, type });
        return await this.request(`/api/search?${params}`);
    }

    // Community API Methods
    async getPosts(filters = {}) {
        const params = new URLSearchParams(filters);
        return await this.request(`/api/community/posts?${params}`);
    }

    async createPost(postData, imageFiles = []) {
        const formData = new FormData();
        formData.append('data', JSON.stringify(postData));
        
        imageFiles.forEach((file, index) => {
            formData.append(`image_${index}`, file);
        });

        return await this.request('/api/community/posts', {
            method: 'POST',
            body: formData,
            headers: {
                'Authorization': this.token ? `Bearer ${this.token}` : ''
            }
        });
    }

    async likePost(postId) {
        return await this.request(`/api/community/posts/${postId}/like`, {
            method: 'POST'
        });
    }

    async getComments(postId) {
        return await this.request(`/api/community/posts/${postId}/comments`);
    }

    async addComment(postId, content) {
        return await this.request(`/api/community/posts/${postId}/comments`, {
            method: 'POST',
            body: JSON.stringify({ content })
        });
    }

    // Utility methods
    isAuthenticated() {
        return !!this.token && !!this.currentUser;
    }

    requireAuth() {
        if (!this.isAuthenticated()) {
            window.location.href = '/';
            return false;
        }
        return true;
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);

        if (diffInSeconds < 60) {
            return 'Just now';
        } else if (diffInSeconds < 3600) {
            const minutes = Math.floor(diffInSeconds / 60);
            return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
        } else if (diffInSeconds < 86400) {
            const hours = Math.floor(diffInSeconds / 3600);
            return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        } else if (diffInSeconds < 604800) {
            const days = Math.floor(diffInSeconds / 86400);
            return `${days} day${days > 1 ? 's' : ''} ago`;
        } else {
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        }
    }

    getAvatarInitials(name) {
        if (!name) return 'UN';
        return name.split(' ')
            .map(word => word.charAt(0).toUpperCase())
            .slice(0, 2)
            .join('');
    }

    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    showNotification(message, type = 'info') {
        console.log(`[${type.toUpperCase()}] ${message}`);
        
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
                <span>${message}</span>
            </div>
            <button class="notification-close" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        // Style the notification
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '12px 16px',
            backgroundColor: this.getNotificationColor(type),
            color: 'white',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            zIndex: '10000',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            maxWidth: '400px',
            animation: 'slideInRight 0.3s ease',
            fontFamily: 'Inter, sans-serif'
        });
        
        document.body.appendChild(notification);
        
        // Auto-remove after 4 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideOutRight 0.3s ease';
                setTimeout(() => notification.remove(), 300);
            }
        }, 4000);
    }

    getNotificationColor(type) {
        switch (type) {
            case 'success': return '#10b981';
            case 'error': return '#ef4444';
            case 'warning': return '#f59e0b';
            default: return '#3b82f6';
        }
    }

    showLoadingSpinner(element, show = true) {
        if (!element) return;
        
        if (show) {
            element.style.position = 'relative';
            element.style.opacity = '0.6';
            
            const spinner = document.createElement('div');
            spinner.className = 'loading-spinner-overlay';
            spinner.innerHTML = `
                <div class="loading-spinner">
                    <i class="fas fa-spinner fa-spin"></i>
                </div>
            `;
            
            Object.assign(spinner.style, {
                position: 'absolute',
                top: '0',
                left: '0',
                right: '0',
                bottom: '0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(255,255,255,0.8)',
                zIndex: '100'
            });
            
            element.appendChild(spinner);
        } else {
            element.style.opacity = '';
            const spinner = element.querySelector('.loading-spinner-overlay');
            if (spinner) spinner.remove();
        }
    }

    validatePassword(password) {
        return password.length >= 6;
    }

    showNotification(message, type = 'info', duration = 3000) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas ${type === 'success' ? 'fa-check-circle' : 
                              type === 'error' ? 'fa-exclamation-circle' : 
                              type === 'warning' ? 'fa-exclamation-triangle' : 
                              'fa-info-circle'}"></i>
                <span>${message}</span>
            </div>
            <button class="notification-close" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#4CAF50' : 
                        type === 'error' ? '#f44336' : 
                        type === 'warning' ? '#ff9800' : 
                        'var(--accent-primary)'};
            color: white;
            padding: 16px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            z-index: 10000;
            transform: translateX(400px);
            transition: transform 0.3s ease;
            max-width: 400px;
            display: flex;
            align-items: center;
            gap: 12px;
        `;

        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        // Auto remove
        setTimeout(() => {
            notification.style.transform = 'translateX(400px)';
            setTimeout(() => {
                if (notification.parentElement) {
                    notification.parentElement.removeChild(notification);
                }
            }, 300);
        }, duration);

        return notification;
    }

    showLoadingSpinner(element, show = true) {
        if (show) {
            element.style.opacity = '0.6';
            element.style.pointerEvents = 'none';
            
            if (!element.querySelector('.loading-spinner')) {
                const spinner = document.createElement('div');
                spinner.className = 'loading-spinner';
                spinner.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
                spinner.style.cssText = `
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    z-index: 1000;
                    color: var(--accent-primary);
                `;
                element.style.position = 'relative';
                element.appendChild(spinner);
            }
        } else {
            element.style.opacity = '1';
            element.style.pointerEvents = 'auto';
            
            const spinner = element.querySelector('.loading-spinner');
            if (spinner) {
                spinner.remove();
            }
        }
    }

    // File handling utilities
    async fileToDataURI(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    compressImage(file, maxWidth = 800, quality = 0.8) {
        return new Promise((resolve) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();

            img.onload = () => {
                const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
                canvas.width = img.width * ratio;
                canvas.height = img.height * ratio;

                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                
                canvas.toBlob(resolve, 'image/jpeg', quality);
            };

            img.src = URL.createObjectURL(file);
        });
    }
}

// Create global API instance
window.api = new OpenRocketsAPI();

// Auto-redirect to dashboard if authenticated and on landing page
document.addEventListener('DOMContentLoaded', () => {
    const currentPath = window.location.pathname;
    
    if (currentPath === '/' && api.isAuthenticated()) {
        window.location.href = '/dashboard';
    }
    
    // Update UI based on authentication status
    updateAuthUI();
});

function updateAuthUI() {
    const authButtons = document.querySelectorAll('.auth-btn');
    const userMenu = document.querySelector('.user-menu');
    const profileImage = document.querySelector('.profile-image');
    
    if (api.isAuthenticated()) {
        authButtons.forEach(btn => btn.style.display = 'none');
        
        if (userMenu) {
            userMenu.style.display = 'block';
        }
        
        if (profileImage && api.currentUser.profileImage) {
            profileImage.src = api.currentUser.profileImage;
        }
        
        // Update user info in sidebar/header
        const userNameElements = document.querySelectorAll('.user-name');
        userNameElements.forEach(element => {
            element.textContent = api.currentUser.fullName || api.currentUser.username;
        });
        
        const userEmailElements = document.querySelectorAll('.user-email');
        userEmailElements.forEach(element => {
            element.textContent = api.currentUser.email;
        });
    } else {
        authButtons.forEach(btn => btn.style.display = 'block');
        
        if (userMenu) {
            userMenu.style.display = 'none';
        }
    }
}

// Global logout function
function logout() {
    api.logout();
}
