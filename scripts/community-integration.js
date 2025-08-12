// Community Page Integration with Backend
document.addEventListener('DOMContentLoaded', async function() {
    // Ensure user is authenticated
    if (!api.requireAuth()) return;

    // Load community data
    await loadCommunityData();
    
    // Set up real-time features
    setupCommunityFeatures();
});

async function loadCommunityData() {
    try {
        // Show loading state
        showCommunityLoading(true);
        
        // Load posts
        await loadPosts();
        
        // Load trending topics
        await loadTrendingTopics();
        
        // Load active users
        await loadActiveUsers();
        
        // Load study groups
        await loadStudyGroups();
        
    } catch (error) {
        console.error('Failed to load community data:', error);
        api.showNotification('Failed to load community data', 'error');
    } finally {
        showCommunityLoading(false);
    }
}

async function loadPosts(category = 'all') {
    try {
        const filters = category !== 'all' ? { category } : {};
        const response = await api.getPosts(filters);
        const posts = response.posts || [];
        
        const postsContainer = document.querySelector('.posts-container');
        if (!postsContainer) return;
        
        postsContainer.innerHTML = '';
        
        if (posts.length === 0) {
            postsContainer.innerHTML = `
                <div class="no-posts">
                    <i class="fas fa-comments"></i>
                    <h3>No posts yet</h3>
                    <p>Be the first to share something with the community!</p>
                    <button class="btn-primary" onclick="openCreatePostModal()">
                        <i class="fas fa-plus"></i>
                        Create Post
                    </button>
                </div>
            `;
            return;
        }
        
        for (const post of posts) {
            const postElement = await createPostElement(post);
            postsContainer.appendChild(postElement);
        }
        
    } catch (error) {
        console.error('Failed to load posts:', error);
    }
}

async function createPostElement(post) {
    const postDiv = document.createElement('div');
    postDiv.className = 'post';
    postDiv.id = `post-${post.id}`;
    
    // Load comments for this post
    let comments = [];
    try {
        const commentsResponse = await api.getComments(post.id);
        comments = commentsResponse.comments || [];
    } catch (error) {
        console.error('Failed to load comments for post:', post.id);
    }
    
    const isLiked = false; // TODO: Track user likes
    const isSaved = false; // TODO: Track user saves
    
    postDiv.innerHTML = `
        <div class="post-header">
            <div class="post-author">
                <div class="user-avatar">
                    ${post.author.profileImage ? 
                        `<img src="${post.author.profileImage}" alt="${post.author.fullName}">` :
                        `<span>${api.getAvatarInitials(post.author.fullName)}</span>`
                    }
                </div>
                <div class="author-info">
                    <div class="author-name">
                        ${post.author.fullName}
                        ${post.author.verified ? '<i class="fas fa-check-circle verified"></i>' : ''}
                    </div>
                    <div class="post-meta">
                        <span class="post-time">${api.formatDate(post.createdAt)}</span>
                        <span class="post-category">${post.category}</span>
                    </div>
                </div>
            </div>
            <div class="post-menu">
                <button class="menu-btn" onclick="showPostMenu('${post.id}')">
                    <i class="fas fa-ellipsis-h"></i>
                </button>
            </div>
        </div>
        
        <div class="post-content">
            ${post.title ? `<h3 class="post-title">${post.title}</h3>` : ''}
            <div class="post-text">${formatPostContent(post.content)}</div>
            ${post.images && post.images.length > 0 ? createImageGallery(post.images) : ''}
            ${post.tags && post.tags.length > 0 ? createTagsHTML(post.tags) : ''}
        </div>
        
        <div class="post-footer">
            <div class="post-stats">
                <span>${post.likes} likes</span>
                <span>${comments.length} comments</span>
                <span>${post.shares || 0} shares</span>
            </div>
            <div class="post-actions">
                <button class="action-btn ${isLiked ? 'liked' : ''}" onclick="toggleLike('${post.id}', this)">
                    <i class="fas fa-heart"></i>
                    <span>${isLiked ? 'Liked' : 'Like'}</span>
                </button>
                <button class="action-btn" onclick="toggleComments('${post.id}')">
                    <i class="fas fa-comment"></i>
                    <span>Comment</span>
                </button>
                <button class="action-btn ${isSaved ? 'saved' : ''}" onclick="toggleSave('${post.id}', this)">
                    <i class="fas fa-bookmark"></i>
                    <span>${isSaved ? 'Saved' : 'Save'}</span>
                </button>
                <button class="action-btn" onclick="sharePost('${post.id}')">
                    <i class="fas fa-share"></i>
                    <span>Share</span>
                </button>
            </div>
        </div>
        
        <div class="comments-section" id="comments-${post.id}" style="display: none;">
            <div class="comments-list">
                ${comments.map(comment => createCommentHTML(comment)).join('')}
            </div>
            <div class="add-comment">
                <div class="user-avatar mini">
                    ${api.currentUser.profileImage ? 
                        `<img src="${api.currentUser.profileImage}" alt="You">` :
                        `<span>${api.getAvatarInitials(api.currentUser.fullName)}</span>`
                    }
                </div>
                <div class="comment-input-group">
                    <input type="text" class="comment-input" placeholder="Write a comment..." 
                           onkeypress="handleCommentKeypress(event, '${post.id}')">
                    <button class="send-comment" onclick="submitComment('${post.id}')" disabled>
                        <i class="fas fa-paper-plane"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
    
    return postDiv;
}

function createImageGallery(images) {
    if (images.length === 1) {
        return `<div class="post-images single"><img src="${images[0]}" alt="Post image" onclick="openImageModal('${images[0]}')"></div>`;
    } else {
        const imageHTML = images.map((image, index) => 
            `<img src="${image}" alt="Post image ${index + 1}" onclick="openImageModal('${image}')">`
        ).join('');
        return `<div class="post-images multiple">${imageHTML}</div>`;
    }
}

function createTagsHTML(tags) {
    const tagsHTML = tags.map(tag => `<span class="tag">${tag}</span>`).join('');
    return `<div class="post-tags">${tagsHTML}</div>`;
}

function createCommentHTML(comment) {
    return `
        <div class="comment" id="comment-${comment.id}">
            <div class="comment-author">
                <div class="user-avatar mini">
                    ${comment.author.profileImage ? 
                        `<img src="${comment.author.profileImage}" alt="${comment.author.fullName}">` :
                        `<span>${api.getAvatarInitials(comment.author.fullName)}</span>`
                    }
                </div>
                <div class="comment-info">
                    <span class="comment-author-name">${comment.author.fullName}</span>
                    <span class="comment-time">${api.formatDate(comment.createdAt)}</span>
                </div>
            </div>
            <div class="comment-content">
                <p>${comment.content}</p>
            </div>
            <div class="comment-actions">
                <button class="comment-action" onclick="likeComment('${comment.id}', this)">
                    <i class="fas fa-heart"></i>
                    <span>${comment.likes || 0}</span>
                </button>
                <button class="comment-action" onclick="replyToComment('${comment.id}')">Reply</button>
            </div>
        </div>
    `;
}

function formatPostContent(content) {
    // Basic formatting for code blocks, links, etc.
    return content
        .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
        .replace(/`([^`]+)`/g, '<code>$1</code>')
        .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank">$1</a>')
        .replace(/\n/g, '<br>');
}

async function loadTrendingTopics() {
    try {
        // Mock trending topics for now
        const trendingTopics = [
            { topic: '#ReactJS', posts: 24 },
            { topic: '#JavaScript', posts: 18 },
            { topic: '#Python', posts: 15 },
            { topic: '#WebDev', posts: 12 },
            { topic: '#OpenAI', posts: 9 }
        ];
        
        const trendingContainer = document.querySelector('.trending-topics .trending-list');
        if (trendingContainer) {
            trendingContainer.innerHTML = '';
            
            trendingTopics.forEach(item => {
                const trendingDiv = document.createElement('div');
                trendingDiv.className = 'trending-item';
                trendingDiv.innerHTML = `
                    <div class="trending-topic">${item.topic}</div>
                    <div class="trending-count">${item.posts} posts</div>
                `;
                trendingDiv.addEventListener('click', () => {
                    searchPosts(item.topic);
                });
                trendingContainer.appendChild(trendingDiv);
            });
        }
        
    } catch (error) {
        console.error('Failed to load trending topics:', error);
    }
}

async function loadActiveUsers() {
    try {
        // Mock active users for now
        const activeUsers = [
            { id: '1', name: 'Sarah Chen', status: 'online', avatar: null },
            { id: '2', name: 'Mike Johnson', status: 'coding', avatar: null },
            { id: '3', name: 'Emma Davis', status: 'studying', avatar: null },
            { id: '4', name: 'Alex Rodriguez', status: 'online', avatar: null }
        ];
        
        const activeContainer = document.querySelector('.active-users .users-list');
        if (activeContainer) {
            activeContainer.innerHTML = '';
            
            activeUsers.forEach(user => {
                const userDiv = document.createElement('div');
                userDiv.className = 'active-user';
                userDiv.innerHTML = `
                    <div class="user-avatar mini">
                        ${user.avatar ? 
                            `<img src="${user.avatar}" alt="${user.name}">` :
                            `<span>${api.getAvatarInitials(user.name)}</span>`
                        }
                        <div class="status-indicator ${user.status}"></div>
                    </div>
                    <div class="user-info">
                        <div class="user-name">${user.name}</div>
                        <div class="user-status">${user.status}</div>
                    </div>
                `;
                userDiv.addEventListener('click', () => {
                    // Open user profile or start chat
                    console.log('Open profile:', user.id);
                });
                activeContainer.appendChild(userDiv);
            });
        }
        
    } catch (error) {
        console.error('Failed to load active users:', error);
    }
}

async function loadStudyGroups() {
    try {
        // Mock study groups for now
        const studyGroups = [
            { id: '1', name: 'React Beginners', members: 45, topic: 'React' },
            { id: '2', name: 'Python Study Circle', members: 32, topic: 'Python' },
            { id: '3', name: 'Full Stack Devs', members: 28, topic: 'Full Stack' }
        ];
        
        const groupsContainer = document.querySelector('.study-groups .groups-list');
        if (groupsContainer) {
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
                    <button class="join-group-btn" onclick="joinStudyGroup('${group.id}')">
                        <i class="fas fa-plus"></i>
                    </button>
                `;
                groupsContainer.appendChild(groupDiv);
            });
        }
        
    } catch (error) {
        console.error('Failed to load study groups:', error);
    }
}

function setupCommunityFeatures() {
    // Set up create post modal
    setupCreatePostModal();
    
    // Set up navigation filters
    setupNavigationFilters();
    
    // Set up search functionality
    setupCommunitySearch();
    
    // Set up real-time updates
    setupRealTimeUpdates();
}

function setupCreatePostModal() {
    const createPostForm = document.getElementById('createPostForm');
    if (createPostForm) {
        createPostForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
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
                    tags: formData.get('tags') || ''
                };
                
                const images = Array.from(e.target.querySelectorAll('input[type="file"]'))
                    .map(input => input.files[0])
                    .filter(file => file);
                
                await api.createPost(postData, images);
                
                api.showNotification('Post published successfully!', 'success');
                closeCreatePostModal();
                
                // Reload posts
                await loadPosts();
                
            } catch (error) {
                api.showNotification(error.message, 'error');
            } finally {
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }
        });
    }
}

function setupNavigationFilters() {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', async (e) => {
            e.preventDefault();
            
            // Update active state
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            
            // Filter posts
            const category = link.textContent.toLowerCase().includes('feed') ? 'all' : 
                           link.textContent.toLowerCase();
            await loadPosts(category);
        });
    });
}

function setupCommunitySearch() {
    const searchInput = document.querySelector('.search-box input');
    if (searchInput) {
        let searchTimeout;
        
        searchInput.addEventListener('input', function() {
            clearTimeout(searchTimeout);
            const query = this.value.toLowerCase();
            
            searchTimeout = setTimeout(() => {
                searchPosts(query);
            }, 300);
        });
    }
}

function searchPosts(query) {
    const posts = document.querySelectorAll('.post');
    
    posts.forEach(post => {
        const content = post.textContent.toLowerCase();
        if (query === '' || content.includes(query)) {
            post.style.display = 'block';
        } else {
            post.style.display = 'none';
        }
    });
}

function setupRealTimeUpdates() {
    // Update posts every 30 seconds
    setInterval(async () => {
        const activeFilter = document.querySelector('.nav-link.active');
        const category = activeFilter ? 
            (activeFilter.textContent.toLowerCase().includes('feed') ? 'all' : 
             activeFilter.textContent.toLowerCase()) : 'all';
        
        try {
            await loadPosts(category);
        } catch (error) {
            console.error('Failed to update posts:', error);
        }
    }, 30000);
}

// Global functions for post interactions
window.toggleLike = async (postId, button) => {
    try {
        const response = await api.likePost(postId);
        
        // Update UI
        button.classList.toggle('liked');
        const span = button.querySelector('span');
        const icon = button.querySelector('i');
        
        if (button.classList.contains('liked')) {
            span.textContent = 'Liked';
            icon.style.color = '#ff6b6b';
        } else {
            span.textContent = 'Like';
            icon.style.color = '';
        }
        
        // Update like count
        const post = document.getElementById(`post-${postId}`);
        const likesSpan = post.querySelector('.post-stats span:first-child');
        likesSpan.textContent = `${response.likes} likes`;
        
    } catch (error) {
        api.showNotification('Failed to like post', 'error');
    }
};

window.toggleComments = (postId) => {
    const commentsSection = document.getElementById(`comments-${postId}`);
    const isVisible = commentsSection.style.display !== 'none';
    
    commentsSection.style.display = isVisible ? 'none' : 'block';
    
    if (!isVisible) {
        // Focus on comment input
        const commentInput = commentsSection.querySelector('.comment-input');
        if (commentInput) {
            commentInput.focus();
        }
    }
};

window.submitComment = async (postId) => {
    const commentsSection = document.getElementById(`comments-${postId}`);
    const commentInput = commentsSection.querySelector('.comment-input');
    const content = commentInput.value.trim();
    
    if (!content) return;
    
    try {
        commentInput.disabled = true;
        
        await api.addComment(postId, content);
        
        // Reload comments
        const commentsResponse = await api.getComments(postId);
        const comments = commentsResponse.comments || [];
        
        const commentsList = commentsSection.querySelector('.comments-list');
        commentsList.innerHTML = comments.map(comment => createCommentHTML(comment)).join('');
        
        // Update comment count
        const post = document.getElementById(`post-${postId}`);
        const commentsSpan = post.querySelector('.post-stats span:nth-child(2)');
        commentsSpan.textContent = `${comments.length} comments`;
        
        // Clear input
        commentInput.value = '';
        
        api.showNotification('Comment added successfully!', 'success');
        
    } catch (error) {
        api.showNotification('Failed to add comment', 'error');
    } finally {
        commentInput.disabled = false;
    }
};

window.handleCommentKeypress = (event, postId) => {
    if (event.key === 'Enter') {
        event.preventDefault();
        submitComment(postId);
    }
};

window.openCreatePostModal = () => {
    const modal = document.getElementById('createPostModal');
    if (modal) {
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }
};

window.closeCreatePostModal = () => {
    const modal = document.getElementById('createPostModal');
    if (modal) {
        modal.classList.remove('show');
        document.body.style.overflow = '';
        
        // Reset form
        const form = modal.querySelector('form');
        if (form) form.reset();
    }
};

function showCommunityLoading(show) {
    const loadingElements = document.querySelectorAll('.posts-container, .trending-list, .users-list, .groups-list');
    
    loadingElements.forEach(element => {
        if (show) {
            api.showLoadingSpinner(element, true);
        } else {
            api.showLoadingSpinner(element, false);
        }
    });
}
