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
        // Get current user from API
        this.currentUser = api.currentUser || { id: 'guest', username: 'Guest User' };
        
        // Initialize WebSocket connection
        this.initializeSocket();
        
        // Set up UI components
        this.setupModalHandlers();
        this.setupCreatePostForm();
        this.setupChatFeatures();
        this.setupTagsInput();
        this.setupContentEditor();
        
        // Load initial data
        await this.loadCommunityData();
        
        console.log('🚀 Community Manager initialized');
    }

    initializeSocket() {
        try {
            this.socket = io('http://localhost:3000', {
                autoConnect: true,
                reconnection: true,
                reconnectionAttempts: 5,
                reconnectionDelay: 1000
            });

            this.socket.on('connect', () => {
                console.log('🔌 Connected to community server');
                
                // Join as current user
                this.socket.emit('join-user', {
                    userId: this.currentUser.id,
                    username: this.currentUser.fullName || this.currentUser.username || 'Guest User'
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
        } catch (error) {
            console.warn('Socket.io connection failed:', error);
            // Continue without real-time features
        }
    }

    setupModalHandlers() {
        // Create Post Modal
        const createPostBtn = document.getElementById('createPostBtn');
        const createPostModal = document.getElementById('createPostModal');
        const closeModalBtns = document.querySelectorAll('.close-modal, .cancel-btn');

        if (createPostBtn) {
            createPostBtn.addEventListener('click', () => {
                if (api.isAuthenticated()) {
                    this.openCreatePostModal();
                } else {
                    this.showAuthPrompt('Please log in to create posts!');
                }
            });
        }

        closeModalBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.closeCreatePostModal();
            });
        });

        // Close modal when clicking outside
        if (createPostModal) {
            createPostModal.addEventListener('click', (e) => {
                if (e.target === createPostModal) {
                    this.closeCreatePostModal();
                }
            });
        }
    }

    openCreatePostModal() {
        const modal = document.getElementById('createPostModal');
        if (modal) {
            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
            
            // Focus on title input
            const titleInput = modal.querySelector('#postTitle');
            if (titleInput) {
                setTimeout(() => titleInput.focus(), 100);
            }
        }
    }

    closeCreatePostModal() {
        const modal = document.getElementById('createPostModal');
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = '';
            
            // Reset form
            const form = modal.querySelector('form');
            if (form) form.reset();
            this.tags.clear();
            this.updateTagsDisplay();
        }
    }

    setupCreatePostForm() {
        const createPostForm = document.getElementById('createPostForm');
        if (createPostForm) {
            createPostForm.addEventListener('submit', (e) => this.handlePostSubmission(e));
        }

        // Image upload preview
        const imageInput = document.getElementById('postImages');
        if (imageInput) {
            imageInput.addEventListener('change', (e) => this.handleImagePreview(e));
        }
    }

    handleImagePreview(e) {
        const files = Array.from(e.target.files);
        const previewContainer = document.getElementById('imagePreview');
        
        if (!previewContainer) return;
        
        previewContainer.innerHTML = '';
        
        files.forEach((file, index) => {
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const preview = document.createElement('div');
                    preview.className = 'image-preview-item';
                    preview.innerHTML = `
                        <img src="${e.target.result}" alt="Preview ${index + 1}">
                        <button type="button" class="remove-image" onclick="this.parentElement.remove()">
                            <i class="fas fa-times"></i>
                        </button>
                    `;
                    previewContainer.appendChild(preview);
                };
                reader.readAsDataURL(file);
            }
        });
    }

    setupTagsInput() {
        const tagsInput = document.getElementById('tagsInput');
        const tagsContainer = document.getElementById('tagsContainer');
        
        if (tagsInput) {
            tagsInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' || e.key === ',') {
                    e.preventDefault();
                    const tag = e.target.value.trim().replace(/[^a-zA-Z0-9\s]/g, '');
                    if (tag && !this.tags.has(tag)) {
                        this.addTag(tag);
                        e.target.value = '';
                        this.updateTagsDisplay();
                    }
                }
            });
        }
    }

    addTag(tag) {
        this.tags.add(tag);
        this.updateTagsDisplay();
    }

    removeTag(tag) {
        this.tags.delete(tag);
        this.updateTagsDisplay();
    }

    updateTagsDisplay() {
        const tagsContainer = document.getElementById('tagsContainer');
        if (!tagsContainer) return;
        
        tagsContainer.innerHTML = '';
        
        this.tags.forEach(tag => {
            const tagElement = document.createElement('span');
            tagElement.className = 'tag';
            tagElement.innerHTML = `
                ${tag}
                <button type="button" onclick="communityManager.removeTag('${tag}')">&times;</button>
            `;
            tagsContainer.appendChild(tagElement);
        });
    }

    setupContentEditor() {
        const contentTextarea = document.getElementById('postContent');
        const formatButtons = document.querySelectorAll('.format-btn');
        
        formatButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const action = btn.dataset.format;
                this.applyTextFormatting(action, contentTextarea);
            });
        });
    }

    applyTextFormatting(action, textarea) {
        if (!textarea) return;
        
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = textarea.value.substring(start, end);
        const beforeText = textarea.value.substring(0, start);
        const afterText = textarea.value.substring(end);
        
        let replacement = selectedText;
        
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
            case 'link':
                replacement = `[${selectedText || 'link text'}](url)`;
                break;
            case 'list':
                replacement = `\n- ${selectedText || 'list item'}`;
                break;
        }
        
        textarea.value = beforeText + replacement + afterText;
        
        // Set cursor position
        const newPosition = start + replacement.length;
        textarea.setSelectionRange(newPosition, newPosition);
        textarea.focus();
    }

    setupChatFeatures() {
        const chatInput = document.getElementById('chatInput');
        const chatSendBtn = document.getElementById('chatSendBtn');
        const chatToggle = document.getElementById('chatToggle');
        const chatContainer = document.querySelector('.live-chat-container');

        if (chatToggle && chatContainer) {
            chatToggle.addEventListener('click', () => {
                this.chatVisible = !this.chatVisible;
                chatContainer.classList.toggle('minimized', !this.chatVisible);
                chatToggle.innerHTML = this.chatVisible ? 
                    '<i class="fas fa-minus"></i>' : '<i class="fas fa-comments"></i>';
            });
        }

        if (chatInput) {
            chatInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendChatMessage();
                }
            });

            chatInput.addEventListener('input', () => {
                this.handleTyping();
            });
        }

        if (chatSendBtn) {
            chatSendBtn.addEventListener('click', () => {
                this.sendChatMessage();
            });
        }
    }

    handleTyping() {
        if (!this.socket || !api.isAuthenticated()) return;
        
        this.socket.emit('typing', {
            userId: this.currentUser.id,
            username: this.currentUser.fullName || this.currentUser.username
        });

        // Clear previous timeout
        clearTimeout(this.typingTimeout);
        
        // Set new timeout to stop typing
        this.typingTimeout = setTimeout(() => {
            this.socket.emit('stop-typing', {
                userId: this.currentUser.id
            });
        }, 1000);
    }

    sendChatMessage() {
        const chatInput = document.getElementById('chatInput');
        if (!chatInput || !chatInput.value.trim()) return;

        const message = chatInput.value.trim();
        
        if (!api.isAuthenticated()) {
            this.showAuthPrompt('Please log in to participate in chat!');
            return;
        }

        // Add message locally first for immediate feedback
        const localMessage = {
            id: Date.now(),
            user: this.currentUser.fullName || this.currentUser.username,
            message: message,
            timestamp: new Date().toISOString(),
            userId: this.currentUser.id
        };
        
        this.addChatMessage(localMessage, true);
        
        // Send to server
        if (this.socket) {
            this.socket.emit('chat-message', localMessage);
        }
        
        chatInput.value = '';
    }

    addChatMessage(message, isLocal = false) {
        const chatMessages = document.getElementById('chatMessages');
        if (!chatMessages) return;

        const messageElement = document.createElement('div');
        messageElement.className = `chat-message ${isLocal ? 'local' : ''}`;
        messageElement.innerHTML = `
            <div class="message-avatar">${message.user.charAt(0).toUpperCase()}</div>
            <div class="message-content">
                <div class="message-author">${message.user}</div>
                <div class="message-text">${this.formatChatMessage(message.message)}</div>
                <div class="message-time">${this.formatTime(message.timestamp)}</div>
            </div>
        `;

        chatMessages.appendChild(messageElement);
        
        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;

        // Remove oldest messages if too many
        while (chatMessages.children.length > 100) {
            chatMessages.removeChild(chatMessages.firstChild);
        }
    }

    formatChatMessage(text) {
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`(.*?)`/g, '<code>$1</code>')
            .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank">$1</a>');
    }

    formatTime(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        
        if (diffMins < 1) return 'now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
        return date.toLocaleDateString();
    }

    showTypingIndicator(data) {
        // Show typing indicator for other users
        if (data.userId !== this.currentUser.id) {
            console.log(`${data.username} is typing...`);
        }
    }

    hideTypingIndicator(data) {
        // Hide typing indicator
        console.log(`${data.username} stopped typing`);
    }

    async handlePostSubmission(e) {
        e.preventDefault();
        
        if (!api.isAuthenticated()) {
            this.showAuthPrompt('Please log in to create posts!');
            return;
        }

        const formData = new FormData(e.target);
        const submitBtn = e.target.querySelector('.publish-btn');
        const originalText = submitBtn.innerHTML;

        try {
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Publishing...';
            submitBtn.disabled = true;

            const postData = {
                title: formData.get('title') || '',
                content: formData.get('content'),
                category: formData.get('category') || 'general',
                tags: Array.from(this.tags),
                author: {
                    id: this.currentUser.id,
                    fullName: this.currentUser.fullName || this.currentUser.username,
                    profileImage: this.currentUser.profileImage
                }
            };

            // Handle images
            const imageFiles = Array.from(e.target.querySelectorAll('input[type="file"]'))
                .map(input => input.files[0])
                .filter(file => file);

            // Create post (mock implementation for now)
            const newPost = await this.createPost(postData, imageFiles);
            
            if (this.socket) {
                this.socket.emit('new-post', newPost);
            }

            // Show success and close modal
            this.showNotification('Post published successfully!', 'success');
            this.closeCreatePostModal();
            
            // Reload posts
            await this.loadPosts();

        } catch (error) {
            console.error('Failed to create post:', error);
            this.showNotification(error.message || 'Failed to create post', 'error');
        } finally {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    }

    async createPost(postData, imageFiles = []) {
        // Mock implementation - replace with actual API call
        const post = {
            id: Date.now().toString(),
            ...postData,
            createdAt: new Date().toISOString(),
            likes: 0,
            shares: 0,
            images: [], // Would upload images and get URLs
            verified: false
        };

        return post;
    }

    async loadCommunityData() {
        try {
            // Load posts
            await this.loadPosts();
            
            // Load trending topics
            await this.loadTrendingTopics();
            
            // Load active users
            await this.loadActiveUsers();
            
            // Load study groups
            await this.loadStudyGroups();
            
            // Load initial chat messages
            this.loadInitialChatMessages();
            
        } catch (error) {
            console.error('Failed to load community data:', error);
            this.showNotification('Some features may not work properly', 'warning');
        }
    }

    async loadPosts() {
        const postsContainer = document.querySelector('.posts-feed');
        if (!postsContainer) return;

        // Mock posts for now - replace with API call
        const mockPosts = [
            {
                id: '1',
                title: 'Getting Started with React Hooks',
                content: 'Just finished learning about useState and useEffect. The way React handles state management is amazing! Here\'s what I learned...',
                author: {
                    id: 'user1',
                    fullName: 'Sarah Chen',
                    profileImage: null,
                    verified: true
                },
                category: 'React',
                tags: ['React', 'JavaScript', 'Frontend'],
                createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
                likes: 24,
                shares: 5,
                images: []
            },
            {
                id: '2',
                title: '',
                content: 'Anyone else excited about the new Python 3.12 features? The performance improvements are incredible! 🚀\n\nJust migrated our backend and saw 15% speed improvement.',
                author: {
                    id: 'user2',
                    fullName: 'Mike Johnson',
                    profileImage: null,
                    verified: false
                },
                category: 'Python',
                tags: ['Python', 'Backend', 'Performance'],
                createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
                likes: 18,
                shares: 3,
                images: []
            },
            {
                id: '3',
                title: 'My First Machine Learning Project',
                content: 'Built a sentiment analysis model using TensorFlow! It can classify movie reviews as positive or negative with 89% accuracy. Super proud of this milestone 💪',
                author: {
                    id: 'user3',
                    fullName: 'Emma Davis',
                    profileImage: null,
                    verified: false
                },
                category: 'Machine Learning',
                tags: ['ML', 'TensorFlow', 'Python', 'NLP'],
                createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
                likes: 42,
                shares: 12,
                images: []
            }
        ];

        postsContainer.innerHTML = '';
        
        for (const post of mockPosts) {
            const postElement = this.createPostElement(post);
            postsContainer.appendChild(postElement);
        }
    }

    createPostElement(post) {
        const postDiv = document.createElement('article');
        postDiv.className = 'post';
        postDiv.id = `post-${post.id}`;
        
        const isLiked = false; // TODO: Check if current user liked this post
        
        postDiv.innerHTML = `
            <div class="post-header">
                <div class="post-author">
                    <div class="user-avatar">
                        ${post.author.profileImage ? 
                            `<img src="${post.author.profileImage}" alt="${post.author.fullName}">` :
                            `<span>${post.author.fullName.charAt(0)}</span>`
                        }
                    </div>
                    <div class="author-info">
                        <div class="author-name">
                            ${post.author.fullName}
                            ${post.author.verified ? '<i class="fas fa-check-circle verified"></i>' : ''}
                        </div>
                        <div class="post-meta">
                            <span class="post-time">${this.formatTime(post.createdAt)}</span>
                            <span class="post-category">${post.category}</span>
                        </div>
                    </div>
                </div>
                <div class="post-menu">
                    <button class="menu-btn" onclick="communityManager.showPostMenu('${post.id}')">
                        <i class="fas fa-ellipsis-h"></i>
                    </button>
                </div>
            </div>
            
            <div class="post-content">
                ${post.title ? `<h3 class="post-title">${post.title}</h3>` : ''}
                <div class="post-text">${this.formatPostContent(post.content)}</div>
                ${post.images && post.images.length > 0 ? this.createImageGallery(post.images) : ''}
                ${post.tags && post.tags.length > 0 ? this.createTagsHTML(post.tags) : ''}
            </div>
            
            <div class="post-footer">
                <div class="post-stats">
                    <span>${post.likes} likes</span>
                    <span>0 comments</span>
                    <span>${post.shares || 0} shares</span>
                </div>
                <div class="post-actions">
                    <button class="action-btn ${isLiked ? 'liked' : ''}" onclick="communityManager.toggleLike('${post.id}', this)">
                        <i class="fas fa-heart"></i>
                        <span>${isLiked ? 'Liked' : 'Like'}</span>
                    </button>
                    <button class="action-btn" onclick="communityManager.toggleComments('${post.id}')">
                        <i class="fas fa-comment"></i>
                        <span>Comment</span>
                    </button>
                    <button class="action-btn" onclick="communityManager.sharePost('${post.id}')">
                        <i class="fas fa-share"></i>
                        <span>Share</span>
                    </button>
                </div>
            </div>
            
            <div class="comments-section" id="comments-${post.id}" style="display: none;">
                <div class="comments-list"></div>
                <div class="add-comment">
                    <div class="user-avatar mini">
                        <span>${this.currentUser.fullName ? this.currentUser.fullName.charAt(0) : 'G'}</span>
                    </div>
                    <div class="comment-input-group">
                        <input type="text" class="comment-input" placeholder="Write a comment..." 
                               onkeypress="communityManager.handleCommentKeypress(event, '${post.id}')">
                        <button class="send-comment" onclick="communityManager.submitComment('${post.id}')">
                            <i class="fas fa-paper-plane"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        return postDiv;
    }

    formatPostContent(content) {
        return content
            .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
            .replace(/`([^`]+)`/g, '<code>$1</code>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" rel="noopener">$1</a>')
            .replace(/\n/g, '<br>');
    }

    createImageGallery(images) {
        if (images.length === 1) {
            return `<div class="post-images single"><img src="${images[0]}" alt="Post image" onclick="communityManager.openImageModal('${images[0]}')"></div>`;
        } else {
            const imageHTML = images.map((image, index) => 
                `<img src="${image}" alt="Post image ${index + 1}" onclick="communityManager.openImageModal('${image}')">`
            ).join('');
            return `<div class="post-images multiple">${imageHTML}</div>`;
        }
    }

    createTagsHTML(tags) {
        const tagsHTML = tags.map(tag => `<span class="tag">${tag}</span>`).join('');
        return `<div class="post-tags">${tagsHTML}</div>`;
    }

    async loadTrendingTopics() {
        const trendingContainer = document.querySelector('.trending-list');
        if (!trendingContainer) return;

        const trendingTopics = [
            { topic: '#ReactJS', posts: 156 },
            { topic: '#JavaScript', posts: 142 },
            { topic: '#Python', posts: 128 },
            { topic: '#WebDev', posts: 98 },
            { topic: '#AI', posts: 87 },
            { topic: '#OpenSource', posts: 76 }
        ];

        trendingContainer.innerHTML = '';
        
        trendingTopics.forEach(item => {
            const trendingDiv = document.createElement('div');
            trendingDiv.className = 'trending-item';
            trendingDiv.innerHTML = `
                <div class="trending-topic">${item.topic}</div>
                <div class="trending-count">${item.posts} posts</div>
                <div class="trending-sparkline"></div>
            `;
            trendingDiv.addEventListener('click', () => {
                this.filterPostsByTag(item.topic);
            });
            trendingContainer.appendChild(trendingDiv);
        });
    }

    async loadActiveUsers() {
        const usersContainer = document.querySelector('.users-list');
        if (!usersContainer) return;

        const activeUsers = [
            { id: '1', name: 'Sarah Chen', status: 'coding', avatar: null },
            { id: '2', name: 'Mike Johnson', status: 'online', avatar: null },
            { id: '3', name: 'Emma Davis', status: 'studying', avatar: null },
            { id: '4', name: 'Alex Rodriguez', status: 'debugging', avatar: null },
            { id: '5', name: 'Lisa Wang', status: 'online', avatar: null }
        ];

        usersContainer.innerHTML = '';
        
        activeUsers.forEach(user => {
            const userDiv = document.createElement('div');
            userDiv.className = 'active-user';
            userDiv.innerHTML = `
                <div class="user-avatar mini">
                    ${user.avatar ? 
                        `<img src="${user.avatar}" alt="${user.name}">` :
                        `<span>${user.name.charAt(0)}</span>`
                    }
                    <div class="status-indicator ${user.status}"></div>
                </div>
                <div class="user-info">
                    <div class="user-name">${user.name}</div>
                    <div class="user-status">${user.status}</div>
                </div>
                <button class="quick-action" onclick="communityManager.startDirectMessage('${user.id}')">
                    <i class="fas fa-comment-dots"></i>
                </button>
            `;
            usersContainer.appendChild(userDiv);
        });

        // Update online count
        const onlineCount = document.getElementById('onlineCount');
        if (onlineCount) {
            onlineCount.textContent = `${activeUsers.length} online`;
        }
    }

    async loadStudyGroups() {
        const groupsContainer = document.querySelector('.groups-list');
        if (!groupsContainer) return;

        const studyGroups = [
            { id: '1', name: 'React Masters', members: 234, topic: 'React', activity: 'high' },
            { id: '2', name: 'Python Wizards', members: 189, topic: 'Python', activity: 'high' },
            { id: '3', name: 'Full Stack Warriors', members: 156, topic: 'Full Stack', activity: 'medium' },
            { id: '4', name: 'AI Enthusiasts', members: 298, topic: 'AI/ML', activity: 'high' },
            { id: '5', name: 'Open Source Contributors', members: 142, topic: 'Open Source', activity: 'medium' }
        ];

        groupsContainer.innerHTML = '';
        
        studyGroups.forEach(group => {
            const groupDiv = document.createElement('div');
            groupDiv.className = 'study-group';
            groupDiv.innerHTML = `
                <div class="group-info">
                    <div class="group-name">${group.name}</div>
                    <div class="group-meta">
                        <span>${group.members} members</span>
                        <span class="group-topic">${group.topic}</span>
                    </div>
                </div>
                <div class="group-activity">
                    <div class="activity-indicator ${group.activity}"></div>
                </div>
                <button class="join-group-btn" onclick="communityManager.joinStudyGroup('${group.id}')">
                    <i class="fas fa-plus"></i>
                </button>
            `;
            groupsContainer.appendChild(groupDiv);
        });
    }

    loadInitialChatMessages() {
        const chatMessages = document.getElementById('chatMessages');
        if (!chatMessages) return;

        const initialMessages = [
            { user: 'Sarah Chen', message: 'Welcome everyone to the OpenRockets community! 🚀', timestamp: new Date(Date.now() - 10 * 60000).toISOString() },
            { user: 'Mike Johnson', message: 'Just deployed my first React app! Thanks for all the help!', timestamp: new Date(Date.now() - 8 * 60000).toISOString() },
            { user: 'Emma Davis', message: 'Anyone working on machine learning projects? Would love to collaborate!', timestamp: new Date(Date.now() - 5 * 60000).toISOString() },
            { user: 'Alex Rodriguez', message: 'Check out this cool Python library I found: https://github.com/example/library', timestamp: new Date(Date.now() - 2 * 60000).toISOString() }
        ];

        initialMessages.forEach(message => {
            this.addChatMessage(message);
        });
    }

    // Interaction Methods
    toggleLike(postId, button) {
        if (!api.isAuthenticated()) {
            this.showAuthPrompt('Please log in to like posts!');
            return;
        }

        button.classList.toggle('liked');
        const span = button.querySelector('span');
        const icon = button.querySelector('i');
        
        if (button.classList.contains('liked')) {
            span.textContent = 'Liked';
            icon.style.color = '#ff6b6b';
            // TODO: Send like to server
        } else {
            span.textContent = 'Like';
            icon.style.color = '';
            // TODO: Send unlike to server
        }
    }

    toggleComments(postId) {
        const commentsSection = document.getElementById(`comments-${postId}`);
        const isVisible = commentsSection.style.display !== 'none';
        
        commentsSection.style.display = isVisible ? 'none' : 'block';
        
        if (!isVisible) {
            const commentInput = commentsSection.querySelector('.comment-input');
            if (commentInput) {
                commentInput.focus();
            }
        }
    }

    sharePost(postId) {
        if (navigator.share) {
            navigator.share({
                title: 'Check out this post on OpenRockets',
                url: `${window.location.origin}/community.html#post-${postId}`
            });
        } else {
            // Fallback: copy to clipboard
            navigator.clipboard.writeText(`${window.location.origin}/community.html#post-${postId}`);
            this.showNotification('Link copied to clipboard!', 'success');
        }
    }

    submitComment(postId) {
        if (!api.isAuthenticated()) {
            this.showAuthPrompt('Please log in to comment!');
            return;
        }

        const commentsSection = document.getElementById(`comments-${postId}`);
        const commentInput = commentsSection.querySelector('.comment-input');
        const content = commentInput.value.trim();
        
        if (!content) return;

        // TODO: Send comment to server
        commentInput.value = '';
        this.showNotification('Comment added!', 'success');
    }

    handleCommentKeypress(event, postId) {
        if (event.key === 'Enter') {
            event.preventDefault();
            this.submitComment(postId);
        }
    }

    showPostMenu(postId) {
        // TODO: Implement post menu (edit, delete, report, etc.)
        console.log('Show menu for post:', postId);
    }

    joinStudyGroup(groupId) {
        if (!api.isAuthenticated()) {
            this.showAuthPrompt('Please log in to join study groups!');
            return;
        }
        // TODO: Implement join study group
        this.showNotification('Joined study group!', 'success');
    }

    startDirectMessage(userId) {
        if (!api.isAuthenticated()) {
            this.showAuthPrompt('Please log in to send messages!');
            return;
        }
        // TODO: Implement direct messaging
        console.log('Start DM with user:', userId);
    }

    filterPostsByTag(tag) {
        // TODO: Implement tag filtering
        console.log('Filter posts by tag:', tag);
    }

    openImageModal(imageSrc) {
        // TODO: Implement image modal
        console.log('Open image modal:', imageSrc);
    }

    addNewPost(post) {
        const postsContainer = document.querySelector('.posts-feed');
        if (postsContainer) {
            const postElement = this.createPostElement(post);
            postsContainer.insertBefore(postElement, postsContainer.firstChild);
        }
    }

    showAuthPrompt(message) {
        // Use the auth prompt from community-integration.js
        if (typeof showAuthPrompt === 'function') {
            showAuthPrompt(message);
        } else {
            alert(message); // Fallback
        }
    }

    showNotification(message, type = 'info') {
        // Simple notification implementation
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '12px 24px',
            backgroundColor: type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3',
            color: 'white',
            borderRadius: '4px',
            zIndex: '10000',
            animation: 'slideInRight 0.3s ease'
        });
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

// Initialize community manager when DOM is loaded
let communityManager;

document.addEventListener('DOMContentLoaded', () => {
    // Only initialize if we're on the community page
    if (document.querySelector('.community-page')) {
        communityManager = new CommunityManager();
    }
});

// Make it globally accessible for onclick handlers
window.communityManager = communityManager;
