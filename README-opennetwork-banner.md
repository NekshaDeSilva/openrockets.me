# OpenNetwork Collective Banner

An advanced JavaScript banner that automatically displays registration information and system status for any website.

## Features

- ✅ **Auto-Detection**: Automatically detects and displays the current website domain
- ✅ **Professional Design**: Modern glassmorphism design with smooth animations
- ✅ **Responsive**: Fully responsive design that works on all screen sizes
- ✅ **Status Indicator**: Real-time system status with color-coded indicators
- ✅ **Smart Overflow**: Intelligent marquee scrolling when text overflows
- ✅ **Easy Integration**: Single script include - no configuration needed
- ✅ **Customizable**: Full API for programmatic control and customization
- ✅ **Performance**: Lightweight and optimized for fast loading

## Quick Start

Simply include the script in any website:

```html
<script src="https://openrockets.me/scripts/opennetwork-banner.min.js"></script>
```

The banner will automatically:
- Detect the current domain name
- Display at the bottom of the page
- Show the OpenNetwork flag logo
- Link to the affiliate page
- Display current system status

## Demo

See the banner in action: [Demo Page](opennetwork-banner-demo.html)

## Configuration

### Basic Configuration

```javascript
// Access the banner configuration
window.OpenNetworkBanner.config.position = 'top'; // 'top' or 'bottom'
window.OpenNetworkBanner.config.animationDuration = 10000; // milliseconds
```

### Available Settings

| Option | Default | Description |
|--------|---------|-------------|
| `flagLogoUrl` | Auto-detected | URL to the flag logo image |
| `affiliateUrl` | opennetworked.org/en/privacy/affiliates | Affiliate link URL |
| `statusApiUrl` | Auto-detected | Status API endpoint |
| `animationDuration` | 15000 | Marquee animation duration (ms) |
| `checkInterval` | 300000 | Status check interval (ms) |
| `position` | 'bottom' | Banner position ('top' or 'bottom') |

## API Methods

### Initialize Banner
```javascript
window.OpenNetworkBanner.init();
```

### Destroy Banner
```javascript
window.OpenNetworkBanner.destroy();
```

### Update Status
```javascript
window.OpenNetworkBanner.updateStatus('operational', 'All Systems Running');
window.OpenNetworkBanner.updateStatus('warning', 'Minor Issues Detected');
window.OpenNetworkBanner.updateStatus('error', 'Service Temporarily Down');
```

## Status Types

| Type | Color | Use Case |
|------|-------|----------|
| `operational` | Green | Normal operations |
| `warning` | Orange | Minor issues or maintenance |
| `error` | Red | Major issues or outages |

## Browser Support

- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 12+
- ✅ Edge 79+
- ✅ Mobile browsers

## Advanced Usage

### Custom Status Check

```javascript
// Override the default status check
window.OpenNetworkBanner.config.statusApiUrl = 'https://your-api.com/status';

// Or implement custom status logic
setInterval(async () => {
    const customStatus = await checkYourSystemStatus();
    window.OpenNetworkBanner.updateStatus(
        customStatus.level, 
        customStatus.message
    );
}, 60000); // Check every minute
```

### Integration with Frameworks

#### React
```jsx
import { useEffect } from 'react';

function App() {
    useEffect(() => {
        // Banner auto-initializes, but you can control it
        return () => window.OpenNetworkBanner?.destroy();
    }, []);

    return <div>Your app content</div>;
}
```

#### Vue.js
```vue
<template>
    <div>Your app content</div>
</template>

<script>
export default {
    mounted() {
        // Banner auto-initializes
    },
    beforeUnmount() {
        window.OpenNetworkBanner?.destroy();
    }
}
</script>
```

## Customization

### Custom Styling

You can override the banner styles by adding custom CSS:

```css
.opennetwork-banner {
    /* Your custom styles */
    background: linear-gradient(135deg, #your-color 0%, #your-color-2 100%);
}

.on-domain {
    color: #your-highlight-color;
}
```

### Custom Logo

```javascript
window.OpenNetworkBanner.config.flagLogoUrl = 'https://your-domain.com/your-logo.png';
```

## Technical Details

### Performance
- **Bundle size**: ~8KB minified
- **Load time**: <50ms on modern browsers
- **Memory usage**: <1MB
- **CPU usage**: Minimal, only during animations

### Security
- All external links use `rel="noopener noreferrer"`
- No third-party dependencies
- CSP-friendly implementation
- XSS protection built-in

## Troubleshooting

### Banner Not Appearing
1. Check browser console for errors
2. Ensure script is loaded correctly
3. Check for conflicting CSS z-index values
4. Verify no other scripts are interfering

### Status Not Updating
1. Check network connectivity
2. Verify status API endpoint
3. Check browser CORS policies
4. Monitor console for API errors

### Text Overflow Issues
1. Banner automatically handles overflow
2. Marquee activates when needed
3. Responsive breakpoints adjust text size
4. Mobile view hides status text when needed

## License

© 2025 OpenNetwork Collective. All rights reserved.

## Support

For technical support or feature requests, please contact the OpenNetwork Collective team.

---

**Made with ❤️ by OpenNetwork Collective**
