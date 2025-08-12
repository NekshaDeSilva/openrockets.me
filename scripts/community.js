// Community Page JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Create Post Modal
    const createPostBtn = document.getElementById('createPostBtn');
    const createPostModal = document.getElementById('createPostModal');
    const closeModal = document.getElementById('closeModal');
    const cancelPost = document.getElementById('cancelPost');
    const publishPost = document.getElementById('publishPost');
    
    // Modal functionality
    function openModal() {
        createPostModal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }
    
    function closeModalFunc() {
        createPostModal.classList.remove('show');
        document.body.style.overflow = '';
        resetForm();
    }
    
    function resetForm() {
        document.getElementById('postCategory').value = '';
        document.getElementById('postTitle').value = '';
        document.getElementById('postContent').value = '';
        document.getElementById('postTags').value = '';
    }
    
    if (createPostBtn) {
        createPostBtn.addEventListener('click', openModal);
    }
    
    if (closeModal) {
        closeModal.addEventListener('click', closeModalFunc);
    }
    
    if (cancelPost) {
        cancelPost.addEventListener('click', closeModalFunc);
    }
    
    // Close modal when clicking outside
    createPostModal?.addEventListener('click', function(e) {
        if (e.target === this) {
            closeModalFunc();
        }
    });
    
    // Publish post functionality
    if (publishPost) {
        publishPost.addEventListener('click', function() {
            const category = document.getElementById('postCategory').value;
            const title = document.getElementById('postTitle').value;
            const content = document.getElementById('postContent').value;
            const tags = document.getElementById('postTags').value;
            
            if (!content.trim()) {
                alert('Please enter some content for your post.');
                return;
            }
            
            // Simulate post creation
            console.log('Creating post:', { category, title, content, tags });
            
            // Show success message
            this.textContent = 'Publishing...';
            this.disabled = true;
            
            setTimeout(() => {
                alert('Post published successfully!');
                closeModalFunc();
                this.textContent = 'Publish Post';
                this.disabled = false;
            }, 2000);
        });
    }
    
    // Post interaction functionality
    document.querySelectorAll('.action-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            
            const icon = this.querySelector('i');
            const span = this.querySelector('span');
            
            if (icon.classList.contains('fa-heart')) {
                // Like functionality
                this.classList.toggle('liked');
                if (this.classList.contains('liked')) {
                    icon.style.color = '#ff6b6b';
                    span.textContent = 'Liked';
                } else {
                    icon.style.color = '';
                    span.textContent = 'Like';
                }
            } else if (icon.classList.contains('fa-bookmark')) {
                // Save functionality
                this.classList.toggle('saved');
                if (this.classList.contains('saved')) {
                    icon.style.color = '#ffd700';
                    span.textContent = 'Saved';
                } else {
                    icon.style.color = '';
                    span.textContent = 'Save';
                }
            } else if (icon.classList.contains('fa-comment')) {
                // Comment functionality - scroll to comments
                const post = this.closest('.post');
                const commentsSection = post.querySelector('.comments-section');
                if (commentsSection) {
                    commentsSection.scrollIntoView({ behavior: 'smooth' });
                    const commentInput = commentsSection.querySelector('.comment-input');
                    if (commentInput) {
                        commentInput.focus();
                    }
                }
            }
        });
    });
    
    // Comment functionality
    document.querySelectorAll('.comment-input').forEach(input => {
        const sendBtn = input.parentElement.querySelector('.send-comment');
        
        input.addEventListener('input', function() {
            if (sendBtn) {
                sendBtn.disabled = this.value.trim() === '';
            }
        });
        
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && sendBtn && !sendBtn.disabled) {
                submitComment(this, sendBtn);
            }
        });
        
        if (sendBtn) {
            sendBtn.addEventListener('click', function() {
                submitComment(input, this);
            });
        }
    });
    
    function submitComment(input, sendBtn) {
        const comment = input.value.trim();
        if (comment) {
            console.log('Submitting comment:', comment);
            
            // Disable input temporarily
            input.disabled = true;
            sendBtn.disabled = true;
            
            // Simulate comment submission
            setTimeout(() => {
                // Create new comment element
                const commentsSection = input.closest('.comments-section');
                const newComment = createCommentElement(comment);
                const addCommentSection = input.parentElement;
                
                commentsSection.insertBefore(newComment, addCommentSection);
                
                // Reset input
                input.value = '';
                input.disabled = false;
                sendBtn.disabled = true;
                
                // Animate new comment
                newComment.style.opacity = '0';
                newComment.style.transform = 'translateY(-10px)';
                setTimeout(() => {
                    newComment.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                    newComment.style.opacity = '1';
                    newComment.style.transform = 'translateY(0)';
                }, 100);
            }, 1000);
        }
    }
    
    function createCommentElement(content) {
        const comment = document.createElement('div');
        comment.className = 'comment';
        comment.innerHTML = `
            <div class="comment-author">
                <div class="user-avatar mini">JD</div>
                <div class="comment-info">
                    <span class="comment-author-name">John Doe</span>
                    <span class="comment-time">Just now</span>
                </div>
            </div>
            <div class="comment-content">
                <p>${content}</p>
            </div>
            <div class="comment-actions">
                <button class="comment-action">
                    <i class="fas fa-heart"></i>
                    <span>0</span>
                </button>
                <button class="comment-action">Reply</button>
            </div>
        `;
        return comment;
    }
    
    // Comment actions
    document.addEventListener('click', function(e) {
        if (e.target.closest('.comment-action')) {
            const btn = e.target.closest('.comment-action');
            const icon = btn.querySelector('i');
            
            if (icon && icon.classList.contains('fa-heart')) {
                // Like comment
                btn.classList.toggle('liked');
                const count = btn.querySelector('span');
                if (btn.classList.contains('liked')) {
                    icon.style.color = '#ff6b6b';
                    count.textContent = parseInt(count.textContent) + 1;
                } else {
                    icon.style.color = '';
                    count.textContent = parseInt(count.textContent) - 1;
                }
            } else if (btn.textContent.trim() === 'Reply') {
                // Reply to comment
                console.log('Reply to comment');
            }
        }
    });
    
    // Navigation functionality
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all links
            document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
            
            // Add active class to clicked link
            this.classList.add('active');
            
            // Filter posts based on category
            const category = this.textContent.toLowerCase();
            filterPosts(category);
        });
    });
    
    function filterPosts(category) {
        const posts = document.querySelectorAll('.post');
        
        posts.forEach(post => {
            const postCategory = post.querySelector('.post-category');
            if (category === 'home feed' || 
                (postCategory && postCategory.textContent.toLowerCase().includes(category))) {
                post.style.display = 'block';
            } else {
                post.style.display = 'none';
            }
        });
    }
    
    // Load more posts
    const loadMoreBtn = document.querySelector('.load-more-btn');
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', function() {
            this.textContent = 'Loading...';
            this.disabled = true;
            
            // Simulate loading more posts
            setTimeout(() => {
                console.log('Loading more posts...');
                this.textContent = 'Load More Posts';
                this.disabled = false;
            }, 2000);
        });
    }
    
    // Search functionality
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
    
    // Trending topics click
    document.querySelectorAll('.trending-item').forEach(item => {
        item.addEventListener('click', function() {
            const topic = this.querySelector('.trending-topic').textContent;
            searchInput.value = topic;
            searchPosts(topic.toLowerCase());
        });
    });
    
    // Active users click
    document.querySelectorAll('.active-user').forEach(user => {
        user.addEventListener('click', function() {
            const userName = this.querySelector('.user-name').textContent;
            console.log('Viewing profile:', userName);
        });
    });
    
    // Study groups click
    document.querySelectorAll('.study-group').forEach(group => {
        group.addEventListener('click', function() {
            const groupName = this.querySelector('.group-name').textContent;
            console.log('Joining study group:', groupName);
        });
    });
    
    // Post menu functionality
    document.querySelectorAll('.post-menu').forEach(menu => {
        menu.addEventListener('click', function() {
            console.log('Post menu clicked');
            // Show post options menu
        });
    });
    
    // Code block syntax highlighting simulation
    document.querySelectorAll('pre code').forEach(block => {
        // Simple syntax highlighting for JavaScript
        let html = block.innerHTML;
        
        // Keywords
        html = html.replace(/\b(const|let|var|function|return|if|else|for|while|class|import|export)\b/g, 
            '<span style="color: #569cd6;">$1</span>');
        
        // Strings
        html = html.replace(/'([^']*)'/g, '<span style="color: #ce9178;">\'$1\'</span>');
        html = html.replace(/"([^"]*)"/g, '<span style="color: #ce9178;">"$1"</span>');
        
        // Comments
        html = html.replace(/\/\/.*$/gm, '<span style="color: #6a9955;">$&</span>');
        
        // Numbers
        html = html.replace(/\b\d+\b/g, '<span style="color: #b5cea8;">$&</span>');
        
        block.innerHTML = html;
    });
    
    // Auto-resize textareas
    document.querySelectorAll('textarea').forEach(textarea => {
        textarea.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = this.scrollHeight + 'px';
        });
    });
    
    // Emoji reactions simulation
    function addEmojiReactions() {
        const reactions = ['👍', '❤️', '😂', '🎉', '💯'];
        document.querySelectorAll('.post').forEach(post => {
            const footer = post.querySelector('.post-footer');
            if (footer && !footer.querySelector('.emoji-reactions')) {
                const reactionDiv = document.createElement('div');
                reactionDiv.className = 'emoji-reactions';
                reactionDiv.style.cssText = 'margin-top: 12px; display: flex; gap: 8px;';
                
                reactions.forEach(emoji => {
                    const btn = document.createElement('button');
                    btn.className = 'emoji-btn';
                    btn.textContent = emoji;
                    btn.style.cssText = `
                        background: none;
                        border: 1px solid var(--border-color);
                        border-radius: 16px;
                        padding: 4px 8px;
                        cursor: pointer;
                        font-size: 0.9rem;
                        transition: all 0.2s ease;
                    `;
                    
                    btn.addEventListener('click', function() {
                        this.style.background = 'var(--accent-primary)';
                        this.style.borderColor = 'var(--accent-primary)';
                        this.style.transform = 'scale(1.1)';
                        
                        setTimeout(() => {
                            this.style.transform = 'scale(1)';
                        }, 200);
                    });
                    
                    reactionDiv.appendChild(btn);
                });
                
                footer.insertBefore(reactionDiv, footer.firstChild);
            }
        });
    }
    
    // Add emoji reactions to posts
    setTimeout(addEmojiReactions, 1000);
});
