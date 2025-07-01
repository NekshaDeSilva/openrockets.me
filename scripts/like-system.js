/**
 * Like System for OpenRockets Member Profiles
 * Uses localStorage to track likes and simulates real-time data
 */

class LikeSystem {
    constructor() {
        this.baseUrl = 'https://api.github.com/repos/openrockets'; // Fallback to GitHub API
        this.init();
    }

    init() {
        this.createLikeButtons();
        this.loadLikeCounts();
    }

    /**
     * Create like buttons for all profile cards
     */
    createLikeButtons() {
        const profileCards = document.querySelectorAll('.profileCard-nav-right');
        
        profileCards.forEach((navRight, index) => {
            if (!navRight.querySelector('.like-button')) {
                const memberName = this.getMemberName();
                const likeButton = this.createLikeButtonHTML(memberName);
                navRight.innerHTML = likeButton;
            }
        });
    }

    /**
     * Get current member name from page URL or title
     */
    getMemberName() {
        const url = window.location.pathname;
        if (url.includes('neksha')) return 'neksha';
        if (url.includes('chethina')) return 'chethina';
        if (url.includes('vidul')) return 'vidul';
        if (url.includes('menul')) return 'menul';
        return 'unknown';
    }

    /**
     * Create like button HTML
     */
    createLikeButtonHTML(memberName) {
        return `
            <div class="like-button" data-member="${memberName}">
                <svg class="like-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path d="m8 2.748-.717-.737C5.6.281 2.514.878 1.4 3.053c-.523 1.023-.641 2.5.314 4.385.92 1.815 2.834 3.989 6.286 6.357 3.452-2.368 5.365-4.542 6.286-6.357.955-1.886.838-3.362.314-4.385C13.486.878 10.4.28 8.717 2.01zM8 15C-7.333 4.868 3.279-3.04 7.824 1.143q.09.083.176.171a3 3 0 0 1 .176-.17C12.72-3.042 23.333 4.867 8 15"/>
                </svg>
                <span class="like-count">...</span>
            </div>
        `;
    }

    /**
     * Load and display like counts
     */
    async loadLikeCounts() {
        const likeButtons = document.querySelectorAll('.like-button');
        
        likeButtons.forEach(async (button) => {
            const memberName = button.dataset.member;
            const likeCount = await this.getLikeCount(memberName);
            const countSpan = button.querySelector('.like-count');
            
            // Animate count loading
            this.animateCountUp(countSpan, likeCount);
            
            // Add click event
            button.addEventListener('click', () => this.handleLike(memberName, button));
            
            // Check if already liked
            if (this.hasUserLiked(memberName)) {
                button.classList.add('liked');
            }
        });
    }

    /**
     * Get like count from various sources
     */
    async getLikeCount(memberName) {
        try {
            // Try to get from GitHub stars first
            const githubCount = await this.getGitHubStars(memberName);
            if (githubCount > 0) {
                const baseCount = githubCount;
                const additionalLikes = this.getStoredLikes(memberName);
                return baseCount + additionalLikes;
            }
        } catch (error) {
            console.log('GitHub API unavailable, using fallback');
        }

        // Fallback: Use realistic random numbers + stored likes
        const baseCount = this.getBaseCount(memberName);
        const additionalLikes = this.getStoredLikes(memberName);
        return baseCount + additionalLikes;
    }

    /**
     * Get GitHub stars for member's repos
     */
    async getGitHubStars(memberName) {
        try {
            const usernames = {
                'neksha': 'nekshadesilva',
                'chethina': 'geek-cheth',
                'vidul': 'vidulhb',
                'menul': 'dms-menula'
            };
            
            const username = usernames[memberName];
            if (!username) return 0;

            const response = await fetch(`https://api.github.com/users/${username}/repos?per_page=5`);
            if (!response.ok) throw new Error('GitHub API error');
            
            const repos = await response.json();
            const totalStars = repos.reduce((sum, repo) => sum + repo.stargazers_count, 0);
            
            return Math.max(totalStars, 0);
        } catch (error) {
            return 0;
        }
    }

    /**
     * Get base count for members (realistic starting numbers)
     */
    getBaseCount(memberName) {
        const baseCounts = {
            'neksha': 127,   // Founder gets higher base
            'chethina': 89,
            'vidul': 94,
            'menul': 67
        };
        
        return baseCounts[memberName] || Math.floor(Math.random() * 50) + 25;
    }

    /**
     * Get stored additional likes from localStorage
     */
    getStoredLikes(memberName) {
        const stored = localStorage.getItem(`likes_${memberName}`);
        return stored ? parseInt(stored) : 0;
    }

    /**
     * Check if user has already liked this member
     */
    hasUserLiked(memberName) {
        return localStorage.getItem(`liked_${memberName}`) === 'true';
    }

    /**
     * Handle like button click
     */
    async handleLike(memberName, button) {
        if (this.hasUserLiked(memberName)) {
            // Already liked - show message or animation
            this.showAlreadyLikedMessage(button);
            return;
        }

        // Add like
        const currentAdditional = this.getStoredLikes(memberName);
        localStorage.setItem(`likes_${memberName}`, (currentAdditional + 1).toString());
        localStorage.setItem(`liked_${memberName}`, 'true');

        // Update UI
        button.classList.add('liked');
        const countSpan = button.querySelector('.like-count');
        const newCount = parseInt(countSpan.textContent) + 1;
        
        // Animate the increment
        this.animateLikeIncrement(countSpan, newCount);
        this.addLikeAnimation(button);
    }

    /**
     * Show already liked message
     */
    showAlreadyLikedMessage(button) {
        const message = document.createElement('div');
        message.className = 'like-message';
        message.textContent = 'Already liked! ❤️';
        
        button.appendChild(message);
        
        setTimeout(() => {
            message.remove();
        }, 2000);
    }

    /**
     * Animate count up effect
     */
    animateCountUp(element, targetCount) {
        let currentCount = 0;
        const increment = Math.ceil(targetCount / 20);
        const timer = setInterval(() => {
            currentCount += increment;
            if (currentCount >= targetCount) {
                currentCount = targetCount;
                clearInterval(timer);
            }
            element.textContent = currentCount.toLocaleString();
        }, 50);
    }

    /**
     * Animate like increment
     */
    animateLikeIncrement(element, newCount) {
        element.style.transform = 'scale(1.2)';
        element.style.color = '#ff6b6b';
        
        setTimeout(() => {
            element.textContent = newCount.toLocaleString();
            element.style.transform = 'scale(1)';
            element.style.color = '';
        }, 200);
    }

    /**
     * Add like animation to button
     */
    addLikeAnimation(button) {
        const icon = button.querySelector('.like-icon');
        
        // Heart animation
        icon.style.transform = 'scale(1.3)';
        icon.style.color = '#ff6b6b';
        
        // Floating hearts effect
        this.createFloatingHearts(button);
        
        setTimeout(() => {
            icon.style.transform = 'scale(1)';
        }, 300);
    }

    /**
     * Create floating hearts animation
     */
    createFloatingHearts(button) {
        for (let i = 0; i < 3; i++) {
            const heart = document.createElement('div');
            heart.innerHTML = '❤️';
            heart.className = 'floating-heart';
            heart.style.cssText = `
                position: absolute;
                pointer-events: none;
                font-size: 12px;
                animation: floatUp 1s ease-out forwards;
                left: ${Math.random() * 20 - 10}px;
                animation-delay: ${i * 0.1}s;
            `;
            
            button.style.position = 'relative';
            button.appendChild(heart);
            
            setTimeout(() => heart.remove(), 1000);
        }
    }
}

// Initialize like system when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new LikeSystem();
});

// Export for manual initialization if needed
window.LikeSystem = LikeSystem;
