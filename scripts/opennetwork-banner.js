/**
 * OpenNetwork Collective Banner
 * Advanced JavaScript banner for website registration display
 * Version: 1.0.0
 */

(function() {
    'use strict';
    
    // Configuration
    const CONFIG = {
        flagLogoUrl: 'https://openrockets.me/assets/i/static-v3/logo_flag.png',
        affiliateUrl: 'https://opennetworked.org/en/privacy/affiliates',
        statusApiUrl: 'https://status.opennetworked.org/api/status', // Placeholder API
        animationDuration: 15000, // 15 seconds for marquee
        checkInterval: 300000, // 5 minutes status check
        position: 'bottom' // 'top' or 'bottom'
    };
    
    // Global state
    let banner = null;
    let statusCheck = null;
    let isMarqueeActive = false;
    
    // Utility functions
    const getCurrentDomain = () => {
        return window.location.hostname.replace('www.', '');
    };
    
    const createSVGIcon = (type, color = '#10B981') => {
        const svgMap = {
            'operational': `
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="6" cy="6" r="6" fill="${color}"/>
                    <circle cx="6" cy="6" r="3" fill="#ffffff" opacity="0.3"/>
                    <circle cx="6" cy="6" r="1.5" fill="#ffffff"/>
                </svg>
            `,
            'warning': `
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="6" cy="6" r="6" fill="#F59E0B"/>
                    <path d="M6 3v3M6 8h.01" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
                </svg>
            `,
            'error': `
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="6" cy="6" r="6" fill="#EF4444"/>
                    <path d="M8 4L4 8M4 4l4 4" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
                </svg>
            `
        };
        return svgMap[type] || svgMap['operational'];
    };
    
    const checkSystemStatus = async () => {
        try {
            // Simulated status check - replace with actual API call
            const response = await fetch(CONFIG.statusApiUrl).catch(() => ({
                ok: true,
                json: () => Promise.resolve({ status: 'operational' })
            }));
            
            if (response.ok) {
                const data = await response.json();
                return {
                    status: data.status || 'operational',
                    message: data.message || 'All Systems Operational'
                };
            }
        } catch (error) {
            console.warn('OpenNetwork Banner: Status check failed', error);
        }
        
        // Fallback to operational status
        return {
            status: 'operational',
            message: 'All Systems Operational'
        };
    };
    
    const updateStatusIndicator = (status, message) => {
        const statusElement = banner.querySelector('.on-status');
        if (!statusElement) return;
        
        const iconElement = statusElement.querySelector('.on-status-icon');
        const textElement = statusElement.querySelector('.on-status-text');
        
        if (iconElement && textElement) {
            iconElement.innerHTML = createSVGIcon(status);
            textElement.textContent = message;
            
            // Update colors based on status
            const colorMap = {
                'operational': '#10B981',
                'warning': '#F59E0B',
                'error': '#EF4444'
            };
            
            textElement.style.color = colorMap[status] || colorMap['operational'];
        }
    };
    
    const checkTextOverflow = () => {
        const textContainer = banner.querySelector('.on-text-content');
        const statusContainer = banner.querySelector('.on-status');
        
        if (!textContainer || !statusContainer) return;
        
        const containerWidth = banner.offsetWidth - 60; // Account for padding
        const textWidth = textContainer.scrollWidth;
        const statusWidth = statusContainer.offsetWidth;
        const totalWidth = textWidth + statusWidth + 20; // 20px gap
        
        if (totalWidth > containerWidth) {
            startMarquee();
        } else {
            stopMarquee();
        }
    };
    
    const startMarquee = () => {
        if (isMarqueeActive) return;
        
        const textContent = banner.querySelector('.on-text-content');
        if (!textContent) return;
        
        isMarqueeActive = true;
        textContent.style.animation = `marquee ${CONFIG.animationDuration}ms linear infinite`;
    };
    
    const stopMarquee = () => {
        if (!isMarqueeActive) return;
        
        const textContent = banner.querySelector('.on-text-content');
        if (!textContent) return;
        
        isMarqueeActive = false;
        textContent.style.animation = 'none';
    };
    
    const createBannerHTML = (domain, status) => {
        return `
            <div class="on-banner-content">
                <div class="on-left-section">
                    <img src="${CONFIG.flagLogoUrl}" alt="OpenNetwork Flag" class="on-flag-logo" />
                    <div class="on-text-content">
                        <span class="on-domain">${domain}</span> is a registered non-profit, currently active in operation under 
                        <a href="${CONFIG.affiliateUrl}" class="on-link" target="_blank" rel="noopener noreferrer">OpenNetwork Collective</a>
                    </div>
                </div>
                <div class="on-status">
                    <div class="on-status-icon">${createSVGIcon(status.status)}</div>
                    <span class="on-status-text">${status.message}</span>
                </div>
            </div>
        `;
    };
    
    const createBannerStyles = () => {
        const style = document.createElement('style');
        style.id = 'opennetwork-banner-styles';
        style.textContent = `
            .opennetwork-banner {
                position: fixed;
                ${CONFIG.position}: 0;
                left: 0;
                right: 0;
                background: linear-gradient(135deg, #1e3a8a 0%, #3730a3 100%);
                color: white;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                font-size: 13px;
                line-height: 1.4;
                z-index: 999999;
                box-shadow: ${CONFIG.position === 'bottom' ? '0 -2px 12px rgba(0,0,0,0.15)' : '0 2px 12px rgba(0,0,0,0.15)'};
                border-${CONFIG.position === 'bottom' ? 'top' : 'bottom'}: 1px solid rgba(255,255,255,0.1);
                backdrop-filter: blur(10px);
                -webkit-backdrop-filter: blur(10px);
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                padding: 8px 16px;
                min-height: 40px;
                display: flex;
                align-items: center;
            }
            
            .opennetwork-banner:hover {
                background: linear-gradient(135deg, #1e40af 0%, #4338ca 100%);
                transform: translateY(${CONFIG.position === 'bottom' ? '-1px' : '1px'});
            }
            
            .on-banner-content {
                display: flex;
                justify-content: space-between;
                align-items: center;
                width: 100%;
                max-width: 1200px;
                margin: 0 auto;
                overflow: hidden;
            }
            
            .on-left-section {
                display: flex;
                align-items: center;
                flex: 1;
                overflow: hidden;
                margin-right: 20px;
            }
            
            .on-flag-logo {
                width: 20px;
                height: 20px;
                margin-right: 12px;
                border-radius: 3px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                transition: transform 0.2s ease;
                flex-shrink: 0;
            }
            
            .on-flag-logo:hover {
                transform: scale(1.1);
            }
            
            .on-text-content {
                white-space: nowrap;
                overflow: hidden;
                color: rgba(255,255,255,0.95);
                font-weight: 400;
            }
            
            .on-domain {
                font-weight: 600;
                color: #fbbf24;
                text-shadow: 0 1px 2px rgba(0,0,0,0.2);
            }
            
            .on-link {
                color: #60a5fa;
                text-decoration: none;
                font-weight: 500;
                transition: all 0.2s ease;
                position: relative;
            }
            
            .on-link:hover {
                color: #93c5fd;
                text-decoration: underline;
                text-underline-offset: 2px;
            }
            
            .on-status {
                display: flex;
                align-items: center;
                background: rgba(255,255,255,0.1);
                padding: 4px 8px;
                border-radius: 20px;
                font-size: 12px;
                font-weight: 500;
                backdrop-filter: blur(5px);
                -webkit-backdrop-filter: blur(5px);
                border: 1px solid rgba(255,255,255,0.15);
                transition: all 0.2s ease;
                flex-shrink: 0;
            }
            
            .on-status:hover {
                background: rgba(255,255,255,0.15);
                transform: scale(1.02);
            }
            
            .on-status-icon {
                margin-right: 6px;
                display: flex;
                align-items: center;
                animation: pulse 2s infinite;
            }
            
            .on-status-text {
                color: #10B981;
                font-weight: 600;
                text-shadow: 0 1px 2px rgba(0,0,0,0.2);
            }
            
            @keyframes marquee {
                0% { transform: translateX(0); }
                100% { transform: translateX(-100%); }
            }
            
            @keyframes pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.7; }
            }
            
            @keyframes slideIn {
                from {
                    opacity: 0;
                    transform: translateY(${CONFIG.position === 'bottom' ? '100%' : '-100%'});
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            .opennetwork-banner.on-animate-in {
                animation: slideIn 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
            }
            
            /* Responsive design */
            @media (max-width: 768px) {
                .opennetwork-banner {
                    font-size: 12px;
                    padding: 6px 12px;
                    min-height: 36px;
                }
                
                .on-flag-logo {
                    width: 16px;
                    height: 16px;
                    margin-right: 8px;
                }
                
                .on-status {
                    font-size: 11px;
                    padding: 3px 6px;
                }
                
                .on-left-section {
                    margin-right: 12px;
                }
            }
            
            @media (max-width: 480px) {
                .opennetwork-banner {
                    font-size: 11px;
                    padding: 5px 8px;
                }
                
                .on-status-text {
                    display: none;
                }
                
                .on-status {
                    width: 20px;
                    height: 20px;
                    justify-content: center;
                    padding: 0;
                    border-radius: 50%;
                }
                
                .on-status-icon {
                    margin-right: 0;
                }
            }
        `;
        return style;
    };
    
    const initBanner = async () => {
        // Prevent multiple initializations
        if (banner) return;
        
        // Get initial status
        const status = await checkSystemStatus();
        const domain = getCurrentDomain();
        
        // Create banner element
        banner = document.createElement('div');
        banner.className = 'opennetwork-banner on-animate-in';
        banner.innerHTML = createBannerHTML(domain, status);
        
        // Add styles
        const styles = createBannerStyles();
        document.head.appendChild(styles);
        
        // Add banner to body
        document.body.appendChild(banner);
        
        // Setup event listeners
        window.addEventListener('resize', checkTextOverflow);
        
        // Check for text overflow after banner is rendered
        setTimeout(() => {
            checkTextOverflow();
            updateStatusIndicator(status.status, status.message);
        }, 100);
        
        // Setup periodic status checks
        statusCheck = setInterval(async () => {
            const newStatus = await checkSystemStatus();
            updateStatusIndicator(newStatus.status, newStatus.message);
        }, CONFIG.checkInterval);
        
        console.log('OpenNetwork Banner initialized for:', domain);
    };
    
    const destroyBanner = () => {
        if (banner) {
            banner.remove();
            banner = null;
        }
        
        if (statusCheck) {
            clearInterval(statusCheck);
            statusCheck = null;
        }
        
        const styles = document.getElementById('opennetwork-banner-styles');
        if (styles) {
            styles.remove();
        }
        
        window.removeEventListener('resize', checkTextOverflow);
        isMarqueeActive = false;
    };
    
    // Public API
    window.OpenNetworkBanner = {
        init: initBanner,
        destroy: destroyBanner,
        updateStatus: updateStatusIndicator,
        config: CONFIG
    };
    
    // Auto-initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initBanner);
    } else {
        initBanner();
    }
    
})();
