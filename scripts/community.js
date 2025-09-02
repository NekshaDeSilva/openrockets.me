// Enhanced Community Page JavaScript with Real-time Features
class CommunityManager {
    constructor() {
        this.socket = null;
        this.currentUser = null;
        this.chatVisible = false;
        this.typingTimeout = null;
        this.tags = new Set();
        
        this.init();
    }

    async init() {
        // Initialize WebSocket connection
        this.initializeSocket();
        
        // Set up UI components
        this.setupModalHandlers();
        this.setupCreatePostForm();
        this.setupChatFeatures();
        this.setupRealTimeUpdates();
        this.setupTagsInput();
        this.setupContentEditor();
        
        // Load initial data
        await this.loadCommunityData();
        
        console.log('🚀 Community Manager initialized');
    }

    initializeSocket() {
        this.socket = io('ws://localhost:3000', {
            autoConnect: true,
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000
        });

        this.socket.on('connect', () => {
            console.log('🔌 Connected to community server');
            
            // Join as current user
            const user = api.currentUser || { id: 'guest', username: 'Guest User' };
            this.socket.emit('join-user', {
                userId: user.id,
                username: user.fullName || user.username || 'Guest User'
            });
        });

        this.socket.on('disconnect', () => {
            console.log('🔌 Disconnected from community server');
        });

        this.socket.on('new-message', (message) => {
            this.addChatMessage(message);
        });

        this.socket.on('new-post', (post) => {
            this.addNewPost(post);
        });

        this.socket.on('user-joined', (user) => {
            console.log('User joined:', user.username);
        });

        this.socket.on('user-left', (user) => {
            console.log('User left:', user.username);
        });

        this.socket.on('typing', (data) => {
            this.showTypingIndicator(data);
        });

        this.socket.on('stop-typing', (data) => {
            this.hideTypingIndicator(data);
        });
    }
    }

        // Real-time message handlers
        this.socket.on('new-message', (message) => {
            this.addChatMessage(message);
        });

        this.socket.on('user-typing', (data) => {
            this.showTypingIndicator(data);
        });

        this.socket.on('user-stop-typing', (data) => {
            this.hideTypingIndicator(data);
        });

        this.socket.on('online-count-update', (count) => {
            this.updateOnlineCount(count);
        });

        this.socket.on('new-post', (post) => {
            this.addNewPostToFeed(post);
        });

        this.socket.on('post-like-update', (data) => {
            this.updatePostLikes(data);
        });
    }

    setupModalHandlers() {
        // Create Post Modal
        const createPostBtn = document.getElementById('createPostBtn');
        const createPostModal = document.getElementById('createPostModal');
        const closeModal = document.getElementById('closeModal');
        const cancelPost = document.getElementById('cancelPost');
        
        createPostBtn?.addEventListener('click', () => this.openCreatePostModal());
        closeModal?.addEventListener('click', () => this.closeCreatePostModal());
        cancelPost?.addEventListener('click', () => this.closeCreatePostModal());
        
        // Chat Modal
        const chatToggleBtn = document.getElementById('chatToggleBtn');
        const chatModal = document.getElementById('chatModal');
        const closeChatModal = document.getElementById('closeChatModal');
        const chatMinimizeBtn = document.getElementById('chatMinimizeBtn');
        
        chatToggleBtn?.addEventListener('click', () => this.toggleChatModal());
        closeChatModal?.addEventListener('click', () => this.closeChatModal());
        chatMinimizeBtn?.addEventListener('click', () => this.minimizeChatModal());
        
        // Close modals on outside click
        window.addEventListener('click', (e) => {
            if (e.target === createPostModal) {
                this.closeCreatePostModal();
            }
            if (e.target === chatModal) {
                this.closeChatModal();
            }
        });
    }

    setupCreatePostForm() {
        const form = document.getElementById('createPostForm');
        const publishBtn = document.getElementById('publishPost');
        const saveDraftBtn = document.getElementById('saveDraftBtn');

        form?.addEventListener('submit', (e) => this.handlePostSubmission(e));
        publishBtn?.addEventListener('click', (e) => this.publishPost(e));
        saveDraftBtn?.addEventListener('click', () => this.saveDraft());

        // Image upload handler
        const imageUpload = document.getElementById('imageUpload');
        imageUpload?.addEventListener('change', (e) => this.handleImageUpload(e));

        // Character counter
        const contentTextarea = document.getElementById('postContent');
        const charCount = document.getElementById('charCount');
        
        contentTextarea?.addEventListener('input', () => {
            const count = contentTextarea.value.length;
            charCount.textContent = count;
            
            if (count > 1800) {
                charCount.style.color = '#EF4444';
            } else if (count > 1500) {
                charCount.style.color = '#F59E0B';
            } else {
                charCount.style.color = 'var(--text-muted)';
            }
        });
    }

    setupTagsInput() {
        const tagsInput = document.getElementById('postTags');
        const tagsDisplay = document.getElementById('tagsDisplay');
        const suggestions = document.querySelectorAll('.tag-suggestion');

        tagsInput?.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ',') {
                e.preventDefault();
                this.addTag(tagsInput.value.trim());
                tagsInput.value = '';
            }
        });

        tagsInput?.addEventListener('blur', () => {
            if (tagsInput.value.trim()) {
                this.addTag(tagsInput.value.trim());
                tagsInput.value = '';
            }
        });

        suggestions.forEach(suggestion => {
            suggestion.addEventListener('click', () => {
                this.addTag(suggestion.dataset.tag);
            });
        });
    }

    addTag(tag) {
        if (!tag || this.tags.has(tag)) return;
        
        this.tags.add(tag);
        this.updateTagsDisplay();
    }

    removeTag(tag) {
        this.tags.delete(tag);
        this.updateTagsDisplay();
    }

    updateTagsDisplay() {
        const tagsDisplay = document.getElementById('tagsDisplay');
        if (!tagsDisplay) return;

        tagsDisplay.innerHTML = '';
        
        this.tags.forEach(tag => {
            const tagElement = document.createElement('div');
            tagElement.className = 'tag-item';
            tagElement.innerHTML = `
                <span>${tag.startsWith('#') ? tag : '#' + tag}</span>
                <span class="tag-remove" onclick="communityManager.removeTag('${tag}')">&times;</span>
            `;
            tagsDisplay.appendChild(tagElement);
        });
    }

    setupContentEditor() {
        const toolbar = document.querySelectorAll('.toolbar-btn');
        const contentTextarea = document.getElementById('postContent');

        toolbar.forEach(btn => {
            btn.addEventListener('click', () => {
                const action = btn.dataset.action;
                this.applyTextFormatting(action, contentTextarea);
            });
        });
    }

    applyTextFormatting(action, textarea) {
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = textarea.value.substring(start, end);
        let replacement = '';

        switch (action) {
            case 'bold':
                replacement = `**${selectedText || 'bold text'}**`;
                break;
            case 'italic':
                replacement = `*${selectedText || 'italic text'}*`;
                break;
            case 'code':
                replacement = `\`${selectedText || 'code'}\``;
                break;
            case 'code-block':
                replacement = `\`\`\`javascript\n${selectedText || 'your code here'}\n\`\`\``;
                break;
            case 'quote':
                replacement = `> ${selectedText || 'quote text'}`;
                break;
            case 'list':
                replacement = `- ${selectedText || 'list item'}`;
                break;
            case 'link':
                const url = prompt('Enter URL:');
                if (url) {
                    replacement = `[${selectedText || 'link text'}](${url})`;
                }
                break;
        }

        if (replacement) {
            textarea.value = textarea.value.substring(0, start) + replacement + textarea.value.substring(end);
            textarea.focus();
            
            // Update character counter
            const charCount = document.getElementById('charCount');
            if (charCount) {
                charCount.textContent = textarea.value.length;
            }
        }
    }

    setupChatFeatures() {
        const chatInput = document.getElementById('chatInput');
        const chatSendBtn = document.getElementById('chatSendBtn');
        const emojiToggleBtn = document.getElementById('emojiToggleBtn');
        const emojiPicker = document.getElementById('chatEmojiPicker');

        // Chat input handlers
        chatInput?.addEventListener('input', (e) => {
            chatSendBtn.disabled = !e.target.value.trim();
            
            // Show typing indicator
            this.handleTyping();
        });

        chatInput?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendChatMessage();
            }
        });

        chatSendBtn?.addEventListener('click', () => this.sendChatMessage());

        // Emoji picker
        emojiToggleBtn?.addEventListener('click', () => {
            emojiPicker.style.display = emojiPicker.style.display === 'flex' ? 'none' : 'flex';
        });

        document.querySelectorAll('.emoji-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const emoji = btn.dataset.emoji;
                chatInput.value += emoji;
                chatInput.focus();
                chatSendBtn.disabled = !chatInput.value.trim();
            });
        });

        // Auto-scroll chat messages
        this.setupChatAutoScroll();
    }

    handleTyping() {
        if (this.socket) {
            this.socket.emit('typing-start', { channel: 'general' });
            
            clearTimeout(this.typingTimeout);
            this.typingTimeout = setTimeout(() => {
                this.socket.emit('typing-stop', { channel: 'general' });
            }, 1000);
        }
    }

    sendChatMessage() {
        const chatInput = document.getElementById('chatInput');
        const message = chatInput.value.trim();
        
        if (!message || !this.socket) return;

        this.socket.emit('send-message', {
            message,
            channel: 'general'
        });

        chatInput.value = '';
        document.getElementById('chatSendBtn').disabled = true;
    }

    addChatMessage(message) {
        const chatMessages = document.getElementById('chatMessages');
        if (!chatMessages) return;

        const messageElement = document.createElement('div');
        messageElement.className = 'chat-message';
        
        const timeAgo = this.getTimeAgo(new Date(message.timestamp));
        
        messageElement.innerHTML = `
            <div class="message-avatar">${this.getAvatarInitials(message.username)}</div>
            <div class="message-content">
                <div class="message-author">${message.username}</div>
                <div class="message-text">${this.formatChatMessage(message.message)}</div>
                <div class="message-time">${timeAgo}</div>
            </div>
        `;

        chatMessages.appendChild(messageElement);
        
        // Animate message appearance
        requestAnimationFrame(() => {
            messageElement.style.opacity = '1';
        });

        // Auto-scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;

        // Play notification sound (optional)
        this.playNotificationSound();
    }

    formatChatMessage(text) {
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`(.*?)`/g, '<code>$1</code>')
            .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank">$1</a>');
    }

    showTypingIndicator(data) {
        const typingIndicator = document.getElementById('typingIndicator');
        if (typingIndicator) {
            typingIndicator.innerHTML = `<span>${data.username}</span> is typing...`;
            typingIndicator.style.display = 'block';
        }
    }

    hideTypingIndicator(data) {
        const typingIndicator = document.getElementById('typingIndicator');
        if (typingIndicator) {
            typingIndicator.style.display = 'none';
        }
    }

    updateOnlineCount(count) {
        const onlineCount = document.getElementById('onlineCount');
        if (onlineCount) {
            onlineCount.textContent = `${count} online`;
        }
    }

    async handlePostSubmission(e) {
        e.preventDefault();
        return this.publishPost(e);
    }

    async publishPost(e) {
        e.preventDefault();
        
        const form = document.getElementById('createPostForm');
        const publishBtn = document.getElementById('publishPost');
        const formData = new FormData(form);
        
        // Add tags
        formData.set('tags', Array.from(this.tags).join(','));
        
        // Add images
        const imageUpload = document.getElementById('imageUpload');
        if (imageUpload.files.length > 0) {
            for (let i = 0; i < imageUpload.files.length; i++) {
                formData.append('images', imageUpload.files[i]);
            }
        }

        try {
            publishBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Publishing...';
            publishBtn.disabled = true;

            const response = await fetch('/api/posts', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: formData
            });

            if (response.ok) {
                const result = await response.json();
                this.showNotification('Post published successfully! 🎉', 'success');
                this.closeCreatePostModal();
                this.resetForm();
            } else {
                throw new Error('Failed to publish post');
            }
        } catch (error) {
            console.error('Error publishing post:', error);
            this.showNotification('Failed to publish post. Please try again.', 'error');
        } finally {
            publishBtn.innerHTML = '<i class="fas fa-rocket"></i> Publish Post';
            publishBtn.disabled = false;
        }
    }

    handleImageUpload(e) {
        const files = Array.from(e.target.files);
        const previewArea = document.getElementById('imagePreviewArea');
        const previews = document.getElementById('imagePreviews');
        
        if (files.length === 0) {
            previewArea.style.display = 'none';
            return;
        }

        previewArea.style.display = 'block';
        previews.innerHTML = '';

        files.forEach((file, index) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const preview = document.createElement('div');
                preview.className = 'image-preview';
                preview.innerHTML = `
                    <img src="${e.target.result}" alt="Preview ${index + 1}">
                    <button type="button" class="remove-image" onclick="this.parentElement.remove()">
                        <i class="fas fa-times"></i>
                    </button>
                `;
                previews.appendChild(preview);
            };
            reader.readAsDataURL(file);
        });
    }

    async loadCommunityData() {
        try {
            // Load trending topics
            await this.loadTrendingTopics();
            
            // Load active users
            await this.loadActiveUsers();
            
            // Load posts
            await this.loadPosts();
            
        } catch (error) {
            console.error('Failed to load community data:', error);
        }
    }

    async loadTrendingTopics() {
        try {
            const response = await fetch('/api/trending', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                this.updateTrendingTopics(data.trending);
            }
        } catch (error) {
            console.error('Failed to load trending topics:', error);
        }
    }

    updateTrendingTopics(trending) {
        // Update trending topics display
        trending.slice(0, 4).forEach((item, index) => {
            const trendingItem = document.querySelector(`[data-trend="${item.topic}"]`);
            if (trendingItem) {
                const postsSpan = trendingItem.querySelector('.trending-posts');
                const trendIcon = postsSpan.querySelector('i');
                
                postsSpan.innerHTML = `
                    <i class="fas fa-arrow-${item.trend === 'up' ? 'up' : 'down'} trend-${item.trend}"></i>
                    ${item.posts} posts today
                `;
            }
        });
    }

    openCreatePostModal() {
        const modal = document.getElementById('createPostModal');
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
        
        // Focus on content textarea
        setTimeout(() => {
            document.getElementById('postContent')?.focus();
        }, 100);
    }

    closeCreatePostModal() {
        const modal = document.getElementById('createPostModal');
        modal.classList.remove('show');
        document.body.style.overflow = '';
        this.resetForm();
    }

    toggleChatModal() {
        const modal = document.getElementById('chatModal');
        if (modal.classList.contains('show')) {
            this.closeChatModal();
        } else {
            modal.classList.add('show');
            document.body.style.overflow = 'hidden';
        }
    }

    closeChatModal() {
        const modal = document.getElementById('chatModal');
        modal.classList.remove('show');
        document.body.style.overflow = '';
    }

    minimizeChatModal() {
        this.closeChatModal();
        // Could implement a minimized chat window here
    }

    resetForm() {
        const form = document.getElementById('createPostForm');
        form?.reset();
        this.tags.clear();
        this.updateTagsDisplay();
        
        const previewArea = document.getElementById('imagePreviewArea');
        if (previewArea) previewArea.style.display = 'none';
        
        const charCount = document.getElementById('charCount');
        if (charCount) charCount.textContent = '0';
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
                <span>${message}</span>
            </div>
            <button class="notification-close">
                <i class="fas fa-times"></i>
            </button>
        `;

        document.body.appendChild(notification);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            notification.remove();
        }, 5000);

        // Close button handler
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.remove();
        });
    }

    getAvatarInitials(name) {
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }

    getTimeAgo(date) {
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);
        
        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
        return `${Math.floor(diffInSeconds / 86400)} days ago`;
    }

    playNotificationSound() {
        // Create a subtle notification sound
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        gainNode.gain.value = 0.1;

        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.1);
    }

    setupRealTimeUpdates() {
        // Set up real-time post interactions
        document.addEventListener('click', (e) => {
            if (e.target.closest('.action-btn')) {
                const btn = e.target.closest('.action-btn');
                const post = btn.closest('.post');
                const postId = post?.id?.replace('post-', '');
                
                if (btn.querySelector('.fa-heart')) {
                    this.handlePostLike(postId, btn);
                }
            }
        });

        // Set up trending topic clicks
        document.addEventListener('click', (e) => {
            if (e.target.closest('.trending-item')) {
                const trendItem = e.target.closest('.trending-item');
                const trend = trendItem.dataset.trend;
                this.filterPostsByTrend(trend);
            }
        });
    }

    async handlePostLike(postId, button) {
        try {
            const response = await fetch(`/api/posts/${postId}/like`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const result = await response.json();
                button.classList.add('liked');
                
                // Update like count
                const post = button.closest('.post');
                const likesSpan = post.querySelector('.post-stats span:first-child');
                if (likesSpan) {
                    likesSpan.textContent = `${result.likes} likes`;
                }
            }
        } catch (error) {
            console.error('Failed to like post:', error);
            this.showNotification('Failed to like post', 'error');
        }
    }

    setupChatAutoScroll() {
        const chatMessages = document.getElementById('chatMessages');
        if (chatMessages) {
            // Smooth scrolling behavior
            chatMessages.style.scrollBehavior = 'smooth';
            
            // Auto-scroll when new messages arrive
            const observer = new MutationObserver(() => {
                chatMessages.scrollTop = chatMessages.scrollHeight;
            });
            
            observer.observe(chatMessages, { childList: true });
        }
    }
}

// Initialize Community Manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.communityManager = new CommunityManager();
});

// Legacy function support for backward compatibility
function openCreatePostModal() {
    window.communityManager?.openCreatePostModal();
}

function closeCreatePostModal() {
    window.communityManager?.closeCreatePostModal();
}
// Legacy function support for backward compatibility
function openCreatePostModal() {
    window.communityManager?.openCreatePostModal();
}

function closeCreatePostModal() {
    window.communityManager?.closeCreatePostModal();
}

// Add notification styles to head
const notificationStyles = `
<style>
.notification {
    position: fixed;
    top: 20px;
    right: 20px;
    background: var(--card-bg);
    border: 1px solid var(--border-color);
    border-radius: 12px;
    padding: 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    min-width: 300px;
    max-width: 400px;
    z-index: 10000;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
    backdrop-filter: blur(20px);
    animation: slideInRight 0.3s ease;
}

.notification-success {
    border-left: 4px solid #10B981;
    background: linear-gradient(135deg, var(--card-bg), rgba(16, 185, 129, 0.05));
}

.notification-error {
    border-left: 4px solid #EF4444;
    background: linear-gradient(135deg, var(--card-bg), rgba(239, 68, 68, 0.05));
}

.notification-info {
    border-left: 4px solid #3B82F6;
    background: linear-gradient(135deg, var(--card-bg), rgba(59, 130, 246, 0.05));
}

.notification-content {
    display: flex;
    align-items: center;
    gap: 10px;
    flex: 1;
}

.notification-content i {
    font-size: 1.2rem;
}

.notification-success i {
    color: #10B981;
}

.notification-error i {
    color: #EF4444;
}

.notification-info i {
    color: #3B82F6;
}

.notification-close {
    background: none;
    border: none;
    color: var(--text-secondary);
    cursor: pointer;
    padding: 4px;
    border-radius: 4px;
    transition: all 0.2s ease;
}

.notification-close:hover {
    background: var(--hover-bg);
    color: var(--text-primary);
}

@keyframes slideInRight {
    from {
        transform: translateX(100%);
        opacity: 0;
    }
    to {
        transform: translateX(0);
        opacity: 1;
    }
}

.image-preview {
    position: relative;
    display: inline-block;
    margin: 8px;
    border-radius: 8px;
    overflow: hidden;
}

.image-preview img {
    width: 120px;
    height: 120px;
    object-fit: cover;
    border-radius: 8px;
}

.remove-image {
    position: absolute;
    top: 4px;
    right: 4px;
    background: rgba(0, 0, 0, 0.7);
    color: white;
    border: none;
    border-radius: 50%;
    width: 24px;
    height: 24px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.8rem;
}

.remove-image:hover {
    background: #EF4444;
}

/* Enhanced chat styles */
.chat-messages::-webkit-scrollbar {
    width: 6px;
}

.chat-messages::-webkit-scrollbar-track {
    background: var(--secondary-bg);
    border-radius: 3px;
}

.chat-messages::-webkit-scrollbar-thumb {
    background: var(--border-color);
    border-radius: 3px;
}

.chat-messages::-webkit-scrollbar-thumb:hover {
    background: var(--text-secondary);
}

/* Mobile responsiveness */
@media (max-width: 768px) {
    .notification {
        top: 10px;
        right: 10px;
        left: 10px;
        min-width: auto;
        max-width: none;
    }
    
    .image-preview img {
        width: 80px;
        height: 80px;
    }
    
    .chat-container {
        height: 250px;
    }
}
</style>
`;

// Inject styles into head
if (!document.head.querySelector('#community-dynamic-styles')) {
    const styleElement = document.createElement('div');
    styleElement.id = 'community-dynamic-styles';
    styleElement.innerHTML = notificationStyles;
    document.head.appendChild(styleElement);
}
