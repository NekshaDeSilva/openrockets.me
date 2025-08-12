// Dashboard Integration with Backend
document.addEventListener('DOMContentLoaded', async function() {
    // Ensure user is authenticated
    if (!api.requireAuth()) return;

    // Load dashboard data
    loadDashboardData();
    
    // Set up real-time updates
    setupRealTimeUpdates();
});

async function loadDashboardData() {
    try {
        // Show loading state
        showDashboardLoading(true);
        
        // Load user profile data
        await loadUserProfile();
        
        // Load upcoming events
        await loadUpcomingEvents();
        
        // Load recent posts
        await loadRecentPosts();
        
        // Load user progress
        await loadUserProgress();
        
        // Load notifications
        await loadNotifications();
        
    } catch (error) {
        console.error('Failed to load dashboard data:', error);
        api.showNotification('Failed to load dashboard data', 'error');
    } finally {
        showDashboardLoading(false);
    }
}

async function loadUserProfile() {
    try {
        const response = await api.getProfile();
        const user = response.user;
        
        // Update user info in sidebar
        const userAvatarElements = document.querySelectorAll('.user-avatar');
        const userNameElements = document.querySelectorAll('.user-name');
        const userTypeElements = document.querySelectorAll('.user-type');
        
        userNameElements.forEach(element => {
            element.textContent = user.fullName || user.username;
        });
        
        userTypeElements.forEach(element => {
            element.textContent = user.userType === 'instructor' ? 'Student Lecturer' : 'Student Learner';
        });
        
        userAvatarElements.forEach(element => {
            if (user.profileImage) {
                if (element.tagName === 'IMG') {
                    element.src = user.profileImage;
                } else {
                    element.style.backgroundImage = `url(${user.profileImage})`;
                }
            } else {
                // Use initials
                const initials = api.getAvatarInitials(user.fullName || user.username);
                element.textContent = initials;
            }
        });
        
        // Update user stats
        updateUserStats(user);
        
    } catch (error) {
        console.error('Failed to load user profile:', error);
    }
}

async function loadUpcomingEvents() {
    try {
        const today = new Date();
        const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
        
        const response = await api.getEvents({
            date: today.toISOString().split('T')[0]
        });
        
        const events = response.events || [];
        
        // Update schedule section
        const scheduleContainer = document.querySelector('.schedule-list');
        if (scheduleContainer) {
            scheduleContainer.innerHTML = '';
            
            if (events.length === 0) {
                scheduleContainer.innerHTML = `
                    <div class="no-data">
                        <i class="fas fa-calendar-plus"></i>
                        <p>No upcoming classes today</p>
                        <a href="/calendar" class="btn-primary small">Browse Classes</a>
                    </div>
                `;
            } else {
                events.slice(0, 5).forEach(event => {
                    const eventElement = createEventElement(event);
                    scheduleContainer.appendChild(eventElement);
                });
            }
        }
        
    } catch (error) {
        console.error('Failed to load events:', error);
    }
}

async function loadRecentPosts() {
    try {
        const response = await api.getPosts({ limit: 3 });
        const posts = response.posts || [];
        
        // Update community highlights section
        const communityContainer = document.querySelector('.community-highlights .highlights-list');
        if (communityContainer) {
            communityContainer.innerHTML = '';
            
            if (posts.length === 0) {
                communityContainer.innerHTML = `
                    <div class="no-data">
                        <i class="fas fa-comments"></i>
                        <p>No recent posts</p>
                        <a href="/community" class="btn-primary small">Explore Community</a>
                    </div>
                `;
            } else {
                posts.forEach(post => {
                    const postElement = createPostHighlight(post);
                    communityContainer.appendChild(postElement);
                });
            }
        }
        
    } catch (error) {
        console.error('Failed to load recent posts:', error);
    }
}

async function loadUserProgress() {
    try {
        // For now, use mock data
        // In a real app, this would come from the backend
        const progressData = {
            coursesCompleted: api.currentUser.coursesCompleted || 0,
            totalCourses: 12,
            studyStreak: api.currentUser.studyStreak || 0,
            hoursThisWeek: 14,
            skillsLearned: api.currentUser.skills ? api.currentUser.skills.length : 0
        };
        
        updateProgressStats(progressData);
        
    } catch (error) {
        console.error('Failed to load user progress:', error);
    }
}

async function loadNotifications() {
    try {
        const response = await api.getNotifications();
        const notifications = response.notifications || [];
        
        // Update notification count
        const notificationBadge = document.querySelector('.notification-badge');
        const unreadCount = notifications.filter(n => !n.read).length;
        
        if (notificationBadge) {
            if (unreadCount > 0) {
                notificationBadge.textContent = unreadCount > 99 ? '99+' : unreadCount;
                notificationBadge.style.display = 'block';
            } else {
                notificationBadge.style.display = 'none';
            }
        }
        
        // Update recent activity
        const activityContainer = document.querySelector('.activity-list');
        if (activityContainer) {
            activityContainer.innerHTML = '';
            
            if (notifications.length === 0) {
                activityContainer.innerHTML = `
                    <div class="no-data">
                        <i class="fas fa-bell"></i>
                        <p>No recent activity</p>
                    </div>
                `;
            } else {
                notifications.slice(0, 5).forEach(notification => {
                    const activityElement = createActivityElement(notification);
                    activityContainer.appendChild(activityElement);
                });
            }
        }
        
    } catch (error) {
        console.error('Failed to load notifications:', error);
    }
}

function createEventElement(event) {
    const eventDiv = document.createElement('div');
    eventDiv.className = 'schedule-item';
    
    const startTime = new Date(`${event.date} ${event.startTime}`);
    const endTime = new Date(`${event.date} ${event.endTime}`);
    
    eventDiv.innerHTML = `
        <div class="schedule-time">
            <span class="time">${formatTime(startTime)}</span>
            <span class="duration">${calculateDuration(startTime, endTime)}</span>
        </div>
        <div class="schedule-details">
            <h4>${event.title}</h4>
            <p>with ${event.instructor.fullName}</p>
            <div class="schedule-meta">
                <span class="type ${event.type}">${event.type}</span>
                <span class="attendees">${event.attendees.length}/${event.maxAttendees}</span>
            </div>
        </div>
        <div class="schedule-actions">
            <button class="join-btn" onclick="joinEventFromDashboard('${event.id}')" 
                    ${event.attendees.includes(api.currentUser.id) ? 'disabled' : ''}>
                <i class="fas fa-video"></i>
                ${event.attendees.includes(api.currentUser.id) ? 'Joined' : 'Join'}
            </button>
        </div>
    `;
    
    return eventDiv;
}

function createPostHighlight(post) {
    const postDiv = document.createElement('div');
    postDiv.className = 'highlight-item';
    
    postDiv.innerHTML = `
        <div class="highlight-content">
            <div class="highlight-author">
                <div class="author-avatar">
                    ${post.author.profileImage ? 
                        `<img src="${post.author.profileImage}" alt="${post.author.fullName}">` :
                        `<span>${api.getAvatarInitials(post.author.fullName)}</span>`
                    }
                </div>
                <div class="author-info">
                    <span class="author-name">${post.author.fullName}</span>
                    <span class="post-time">${api.formatDate(post.createdAt)}</span>
                </div>
            </div>
            <h4>${post.title}</h4>
            <p>${post.content.substring(0, 120)}${post.content.length > 120 ? '...' : ''}</p>
            <div class="highlight-stats">
                <span><i class="fas fa-heart"></i> ${post.likes}</span>
                <span><i class="fas fa-comment"></i> ${post.comments}</span>
            </div>
        </div>
        <div class="highlight-actions">
            <button onclick="window.location.href='/community#post-${post.id}'">
                <i class="fas fa-external-link-alt"></i>
            </button>
        </div>
    `;
    
    return postDiv;
}

function createActivityElement(notification) {
    const activityDiv = document.createElement('div');
    activityDiv.className = 'activity-item';
    
    const iconMap = {
        'grade': 'fa-star',
        'message': 'fa-comment',
        'event': 'fa-calendar',
        'assignment': 'fa-tasks',
        'achievement': 'fa-trophy'
    };
    
    const icon = iconMap[notification.type] || 'fa-bell';
    
    activityDiv.innerHTML = `
        <div class="activity-icon ${notification.type}">
            <i class="fas ${icon}"></i>
        </div>
        <div class="activity-content">
            <p>${notification.message}</p>
            <span class="activity-time">${api.formatDate(notification.timestamp)}</span>
        </div>
        ${notification.type === 'grade' ? `<div class="activity-grade">${notification.grade || 'A+'}</div>` : ''}
    `;
    
    return activityDiv;
}

function updateUserStats(user) {
    // Update reputation
    const reputationElement = document.querySelector('.user-reputation');
    if (reputationElement) {
        reputationElement.textContent = user.reputation || 0;
    }
    
    // Update verification status
    const verifiedElements = document.querySelectorAll('.verified-badge');
    verifiedElements.forEach(element => {
        element.style.display = user.verified ? 'inline' : 'none';
    });
    
    // Update status indicator
    const statusElements = document.querySelectorAll('.status-indicator');
    statusElements.forEach(element => {
        element.className = `status-indicator ${user.status || 'active'}`;
        element.title = user.status || 'active';
    });
}

function updateProgressStats(progressData) {
    // Update course progress
    const courseProgressElement = document.querySelector('.course-progress');
    if (courseProgressElement) {
        const percentage = (progressData.coursesCompleted / progressData.totalCourses) * 100;
        courseProgressElement.style.width = `${percentage}%`;
    }
    
    // Update progress numbers
    const progressStats = {
        'courses-completed': progressData.coursesCompleted,
        'total-courses': progressData.totalCourses,
        'study-streak': progressData.studyStreak,
        'hours-week': progressData.hoursThisWeek,
        'skills-learned': progressData.skillsLearned
    };
    
    Object.entries(progressStats).forEach(([key, value]) => {
        const element = document.querySelector(`[data-stat="${key}"]`);
        if (element) {
            element.textContent = value;
        }
    });
}

function setupRealTimeUpdates() {
    // Set up periodic updates
    setInterval(async () => {
        try {
            await loadNotifications();
        } catch (error) {
            console.error('Failed to update notifications:', error);
        }
    }, 30000); // Update every 30 seconds
    
    // Set up event listeners for quick actions
    setupQuickActions();
}

function setupQuickActions() {
    // Quick join event functionality
    window.joinEventFromDashboard = async (eventId) => {
        try {
            await api.joinEvent(eventId);
            api.showNotification('Successfully joined event!', 'success');
            
            // Refresh events
            await loadUpcomingEvents();
            
        } catch (error) {
            api.showNotification(error.message, 'error');
        }
    };
    
    // Quick create post
    const createPostBtn = document.querySelector('#quickCreatePost');
    if (createPostBtn) {
        createPostBtn.addEventListener('click', () => {
            window.location.href = '/community';
        });
    }
    
    // Quick schedule event (for instructors)
    const scheduleEventBtn = document.querySelector('#quickScheduleEvent');
    if (scheduleEventBtn && api.currentUser.userType === 'instructor') {
        scheduleEventBtn.addEventListener('click', () => {
            window.location.href = '/calendar';
        });
    }
}

function showDashboardLoading(show) {
    const loadingElements = document.querySelectorAll('.dashboard-card');
    
    loadingElements.forEach(element => {
        if (show) {
            api.showLoadingSpinner(element, true);
        } else {
            api.showLoadingSpinner(element, false);
        }
    });
}

function formatTime(date) {
    return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });
}

function calculateDuration(startTime, endTime) {
    const diffMs = endTime - startTime;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffHours > 0) {
        return `${diffHours}h ${diffMinutes}m`;
    } else {
        return `${diffMinutes}m`;
    }
}

// Search functionality
const searchInput = document.querySelector('.search-box input');
if (searchInput) {
    let searchTimeout;
    
    searchInput.addEventListener('input', function() {
        clearTimeout(searchTimeout);
        const query = this.value.trim();
        
        if (query.length < 2) return;
        
        searchTimeout = setTimeout(async () => {
            try {
                const results = await api.search(query);
                showSearchResults(results);
            } catch (error) {
                console.error('Search failed:', error);
            }
        }, 500);
    });
}

function showSearchResults(results) {
    // Create or update search results dropdown
    let resultsContainer = document.querySelector('.search-results');
    
    if (!resultsContainer) {
        resultsContainer = document.createElement('div');
        resultsContainer.className = 'search-results';
        resultsContainer.style.cssText = `
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: var(--bg-secondary);
            border: 1px solid var(--border-color);
            border-radius: 8px;
            max-height: 400px;
            overflow-y: auto;
            z-index: 1000;
            display: none;
        `;
        
        const searchBox = document.querySelector('.search-box');
        searchBox.style.position = 'relative';
        searchBox.appendChild(resultsContainer);
    }
    
    resultsContainer.innerHTML = '';
    
    const totalResults = (results.posts?.length || 0) + 
                        (results.events?.length || 0) + 
                        (results.users?.length || 0);
    
    if (totalResults === 0) {
        resultsContainer.innerHTML = `
            <div class="search-no-results">
                <i class="fas fa-search"></i>
                <p>No results found</p>
            </div>
        `;
    } else {
        // Add posts
        if (results.posts?.length > 0) {
            const postsSection = document.createElement('div');
            postsSection.className = 'search-section';
            postsSection.innerHTML = `
                <div class="search-section-header">
                    <i class="fas fa-file-alt"></i>
                    <span>Posts (${results.posts.length})</span>
                </div>
            `;
            
            results.posts.slice(0, 3).forEach(post => {
                const postItem = document.createElement('div');
                postItem.className = 'search-item';
                postItem.innerHTML = `
                    <div class="search-item-content">
                        <h4>${post.title}</h4>
                        <p>${post.content.substring(0, 80)}...</p>
                    </div>
                `;
                postItem.addEventListener('click', () => {
                    window.location.href = `/community#post-${post.id}`;
                });
                postsSection.appendChild(postItem);
            });
            
            resultsContainer.appendChild(postsSection);
        }
        
        // Add events
        if (results.events?.length > 0) {
            const eventsSection = document.createElement('div');
            eventsSection.className = 'search-section';
            eventsSection.innerHTML = `
                <div class="search-section-header">
                    <i class="fas fa-calendar"></i>
                    <span>Events (${results.events.length})</span>
                </div>
            `;
            
            results.events.slice(0, 3).forEach(event => {
                const eventItem = document.createElement('div');
                eventItem.className = 'search-item';
                eventItem.innerHTML = `
                    <div class="search-item-content">
                        <h4>${event.title}</h4>
                        <p>${event.description.substring(0, 80)}...</p>
                    </div>
                `;
                eventItem.addEventListener('click', () => {
                    window.location.href = `/calendar#event-${event.id}`;
                });
                eventsSection.appendChild(eventItem);
            });
            
            resultsContainer.appendChild(eventsSection);
        }
    }
    
    resultsContainer.style.display = 'block';
    
    // Hide results when clicking outside
    document.addEventListener('click', function hideResults(e) {
        if (!searchInput.contains(e.target) && !resultsContainer.contains(e.target)) {
            resultsContainer.style.display = 'none';
            document.removeEventListener('click', hideResults);
        }
    });
}
