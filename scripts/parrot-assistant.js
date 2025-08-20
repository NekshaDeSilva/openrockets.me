// Parrot Assistant - Interactive Screen Friend
class ParrotAssistant {
    constructor() {
        this.parrot = document.getElementById('parrot-assistant');
        this.bubble = document.getElementById('parrot-bubble');
        this.bubbleContent = document.getElementById('bubble-content');
        this.categoryBadge = document.getElementById('category-badge');
        this.parrotGif = this.parrot.querySelector('.parrot-gif');
        
        this.currentMessageIndex = 0;
        this.isVisible = false;
        this.messageTimeout = null;
        
        // Message categories with content
        this.messages = {
            tips: [
                "💡 Pro tip: Check out our GitHub repositories for amazing open-source projects!",
                "🔥 Hot tip: Join our Discord for real-time collaboration with developers worldwide!",
                "⚡ Quick tip: Star our projects on GitHub to stay updated with new features!",
                "🎯 Dev tip: Start with small issues and work your way up to major contributions!",
                "🚀 Speed tip: Use our web-dev-error-solutions repo to debug faster!"
            ],
            announcements: [
                "📢 New hackathon starting next month! Win amazing prizes and recognition!",
                "🎉 OpenSocial platform now has 5+ contributors! Join the Sri Lankan social media revolution!",
                "📅 Weekly coding meetups every Saturday - virtual and in-person available!",
                "🏆 Top 3 contributors get free domain names and full project ownership!",
                "🌟 We've reached 2.9k+ GitHub stars! Thank you amazing community!"
            ],
            memes: [
                "🦜 *squawk* Why do programmers prefer dark mode? Because light attracts bugs! 😂",
                "🎭 Me: I'll just fix this one small bug... *3 hours later* ...why is everything broken? 🤯",
                "🍕 99 little bugs in the code, 99 little bugs... Take one down, patch it around... 127 little bugs in the code! 😅",
                "🦜 *chirp chirp* Git commit -m 'fixed everything' ...famous last words! 🤡",
                "☕ Coffee: Because debugging at 3 AM is a lifestyle choice, not a requirement! ☕😴"
            ],
            ideas: [
                "💭 Idea: Create a mobile app version of your favorite OpenRockets project!",
                "🌈 Brainstorm: What if we added AR features to CityofGits? Build in 3D space!",
                "🔮 Vision: AI-powered code review bot for our repositories!",
                "🎨 Concept: Design system library for consistent OpenRockets branding!",
                "🌍 Dream: Global coding bootcamp program powered by our community!"
            ]
        };
        
        this.init();
    }
    
    init() {
        // Add entrance animation
        setTimeout(() => {
            this.parrot.classList.add('animate-entrance');
        }, 1000);
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Start showing messages
        setTimeout(() => {
            this.showRandomMessage();
            this.startMessageCycle();
        }, 3000);
    }
    
    setupEventListeners() {
        // Parrot click interaction
        this.parrotGif.addEventListener('click', () => {
            this.bounceParrot();
            this.showRandomMessage();
        });
        
        // Scroll-triggered messages
        let scrollTimeout;
        window.addEventListener('scroll', () => {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                if (Math.random() < 0.1) { // 10% chance on scroll
                    this.showRandomMessage();
                }
            }, 500);
        });
        
        // Hover interactions on feature cards
        document.querySelectorAll('.feature-card, .btn').forEach(element => {
            element.addEventListener('mouseenter', () => {
                if (Math.random() < 0.15) { // 15% chance on hover
                    this.showContextualMessage(element);
                }
            });
        });
        
        // Hide bubble when clicking outside
        document.addEventListener('click', (e) => {
            if (!this.parrot.contains(e.target)) {
                this.hideBubble();
            }
        });
    }
    
    showRandomMessage() {
        const categories = Object.keys(this.messages);
        const randomCategory = categories[Math.floor(Math.random() * categories.length)];
        const messages = this.messages[randomCategory];
        const randomMessage = messages[Math.floor(Math.random() * messages.length)];
        
        this.displayMessage(randomMessage, randomCategory);
    }
    
    showContextualMessage(element) {
        let message = "";
        let category = "tips";
        
        // Context-aware messages based on element
        if (element.classList.contains('btn-primary')) {
            message = "🚀 Ready to start your coding journey? Click that button and let's build something amazing!";
            category = "announcements";
        } else if (element.classList.contains('feature-card')) {
            const tips = [
                "💡 This feature is perfect for beginners! Don't be afraid to dive in!",
                "🌟 Hover over me more often for secret tips and tricks!",
                "🎯 Each feature connects to real projects you can contribute to!"
            ];
            message = tips[Math.floor(Math.random() * tips.length)];
            category = "tips";
        }
        
        if (message) {
            this.displayMessage(message, category);
        }
    }
    
    displayMessage(message, category = 'tips') {
        this.bubbleContent.textContent = message;
        this.categoryBadge.textContent = category.toUpperCase();
        
        // Update category badge color based on type
        const categoryColors = {
            tips: 'var(--gradient-electric)',
            announcements: 'var(--gradient-sunset)',
            memes: 'var(--gradient-cosmic)',
            ideas: 'var(--gradient-neon)'
        };
        
        this.categoryBadge.style.background = categoryColors[category] || 'var(--gradient-electric)';
        
        // Show bubble and badge
        this.bubble.classList.add('show');
        this.categoryBadge.classList.add('show');
        this.isVisible = true;
        
        // Bounce parrot
        this.bounceParrot();
        
        // Auto-hide after 8 seconds
        clearTimeout(this.messageTimeout);
        this.messageTimeout = setTimeout(() => {
            this.hideBubble();
        }, 8000);
    }
    
    hideBubble() {
        this.bubble.classList.remove('show');
        this.categoryBadge.classList.remove('show');
        this.isVisible = false;
    }
    
    bounceParrot() {
        this.parrotGif.classList.remove('bounce');
        setTimeout(() => {
            this.parrotGif.classList.add('bounce');
        }, 10);
        
        setTimeout(() => {
            this.parrotGif.classList.remove('bounce');
        }, 600);
    }
    
    startMessageCycle() {
        // Show random messages every 15-30 seconds
        const showMessage = () => {
            if (!this.isVisible) {
                this.showRandomMessage();
            }
            
            // Random interval between 15-30 seconds
            const nextInterval = 15000 + Math.random() * 15000;
            setTimeout(showMessage, nextInterval);
        };
        
        setTimeout(showMessage, 20000); // First cycle after 20 seconds
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ParrotAssistant();
});

// Add some fun Easter eggs
document.addEventListener('keydown', (e) => {
    // Konami code easter egg (up, up, down, down, left, right, left, right, b, a)
    if (e.code === 'KeyP' && e.ctrlKey) { // Ctrl+P for parrot party
        const parrot = document.getElementById('parrot-assistant');
        if (parrot) {
            const assistant = new ParrotAssistant();
            assistant.displayMessage("🎉 *SQUAWK SQUAWK* You found the secret parrot party! 🦜🎊", "memes");
        }
    }
});
