// Dashboard JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Sidebar toggle for mobile
    const sidebarToggle = document.querySelector('.sidebar-toggle');
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.main-content');
    
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', function() {
            sidebar.classList.toggle('open');
        });
    }
    
    // Close sidebar when clicking outside on mobile
    document.addEventListener('click', function(e) {
        if (window.innerWidth <= 768) {
            if (!sidebar.contains(e.target) && !sidebarToggle.contains(e.target)) {
                sidebar.classList.remove('open');
            }
        }
    });
    
    // Progress bar animations
    function animateProgressBars() {
        const progressBars = document.querySelectorAll('.progress-fill');
        progressBars.forEach(bar => {
            const progress = bar.getAttribute('data-progress');
            if (progress) {
                setTimeout(() => {
                    bar.style.width = progress + '%';
                }, 500);
            }
        });
    }
    
    // Call animation on page load
    animateProgressBars();
    
    // Search functionality
    const searchInput = document.querySelector('.search-box input');
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            const query = e.target.value.toLowerCase();
            // Implement search functionality here
            console.log('Searching for:', query);
        });
    }
    
    // Notification button
    const notificationBtn = document.querySelector('.notification-btn');
    if (notificationBtn) {
        notificationBtn.addEventListener('click', function() {
            // Toggle notification panel
            console.log('Notifications clicked');
        });
    }
    
    // User menu
    const userMenu = document.querySelector('.user-menu');
    if (userMenu) {
        userMenu.addEventListener('click', function() {
            // Toggle user menu dropdown
            console.log('User menu clicked');
        });
    }
    
    // Join buttons
    document.querySelectorAll('.btn-join').forEach(btn => {
        btn.addEventListener('click', function() {
            if (!this.classList.contains('disabled')) {
                // Join class functionality
                console.log('Joining class...');
                this.textContent = 'Joining...';
                this.disabled = true;
                
                setTimeout(() => {
                    this.textContent = 'Joined';
                    this.style.background = 'var(--success-color)';
                }, 2000);
            }
        });
    });
    
    // Submit buttons for assignments
    document.querySelectorAll('.submit-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            // Submit assignment functionality
            console.log('Submitting assignment...');
        });
    });
    
    // Quick action buttons
    document.querySelectorAll('.quick-action-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const action = this.querySelector('span').textContent;
            console.log('Quick action:', action);
        });
    });
    
    // Activity items click
    document.querySelectorAll('.activity-item').forEach(item => {
        item.addEventListener('click', function() {
            // Navigate to activity details
            console.log('Activity clicked');
        });
    });
    
    // Stats animation
    function animateStats() {
        const statNumbers = document.querySelectorAll('.stat-number');
        statNumbers.forEach(stat => {
            const target = parseInt(stat.textContent);
            const duration = 2000;
            const step = target / (duration / 16);
            let current = 0;
            
            const timer = setInterval(() => {
                current += step;
                if (current >= target) {
                    stat.textContent = target + (stat.textContent.includes('h') ? 'h' : '');
                    clearInterval(timer);
                } else {
                    stat.textContent = Math.floor(current) + (stat.textContent.includes('h') ? 'h' : '');
                }
            }, 16);
        });
    }
    
    // Animate stats on page load
    setTimeout(animateStats, 1000);
    
    // Comment functionality
    const commentInputs = document.querySelectorAll('.comment-input');
    commentInputs.forEach(input => {
        const sendBtn = input.parentElement.querySelector('.send-comment');
        
        input.addEventListener('input', function() {
            sendBtn.disabled = this.value.trim() === '';
        });
        
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && !sendBtn.disabled) {
                sendComment(this);
            }
        });
        
        if (sendBtn) {
            sendBtn.addEventListener('click', function() {
                sendComment(input);
            });
        }
    });
    
    function sendComment(input) {
        const comment = input.value.trim();
        if (comment) {
            console.log('Sending comment:', comment);
            input.value = '';
            input.parentElement.querySelector('.send-comment').disabled = true;
        }
    }
    
    // Post actions
    document.querySelectorAll('.post-action').forEach(btn => {
        btn.addEventListener('click', function() {
            const action = this.querySelector('span').textContent;
            const count = parseInt(action);
            
            if (this.querySelector('i').classList.contains('fa-heart')) {
                this.classList.toggle('liked');
                if (this.classList.contains('liked')) {
                    this.querySelector('span').textContent = count + 1;
                    this.style.color = '#ff6b6b';
                } else {
                    this.querySelector('span').textContent = count;
                    this.style.color = '';
                }
            }
        });
    });
    
    // Real-time updates simulation
    function simulateRealTimeUpdates() {
        // Simulate new notifications
        const notificationDot = document.querySelector('.notification-dot');
        if (notificationDot && Math.random() > 0.7) {
            notificationDot.style.display = 'block';
        }
        
        // Update activity feed
        if (Math.random() > 0.8) {
            console.log('New activity received');
        }
    }
    
    // Check for updates every 30 seconds
    setInterval(simulateRealTimeUpdates, 30000);
    
    // Responsive adjustments
    function handleResize() {
        if (window.innerWidth <= 768) {
            sidebar.classList.remove('open');
        }
    }
    
    window.addEventListener('resize', handleResize);
    
    // Initialize tooltips
    function initTooltips() {
        const tooltipElements = document.querySelectorAll('[title]');
        tooltipElements.forEach(element => {
            element.addEventListener('mouseenter', function() {
                const tooltip = document.createElement('div');
                tooltip.className = 'tooltip';
                tooltip.textContent = this.getAttribute('title');
                tooltip.style.cssText = `
                    position: absolute;
                    background: var(--primary-bg);
                    color: var(--text-primary);
                    padding: 4px 8px;
                    border-radius: 4px;
                    font-size: 0.8rem;
                    z-index: 1000;
                    pointer-events: none;
                    box-shadow: var(--shadow-md);
                    border: 1px solid var(--border-color);
                `;
                
                document.body.appendChild(tooltip);
                this.tooltipElement = tooltip;
                
                this.addEventListener('mousemove', function(e) {
                    tooltip.style.left = e.pageX + 10 + 'px';
                    tooltip.style.top = e.pageY - 30 + 'px';
                });
            });
            
            element.addEventListener('mouseleave', function() {
                if (this.tooltipElement) {
                    this.tooltipElement.remove();
                    this.tooltipElement = null;
                }
            });
        });
    }
    
    initTooltips();
});
