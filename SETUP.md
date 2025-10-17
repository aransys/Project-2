# Music Explorer - Setup Guide

## 🚀 Quick Start

### 1. API Key Configuration

Music Explorer uses the Deezer API through RapidAPI. Follow these steps to configure your API key:

#### Option A: Using the existing configuration (Development)
The project includes a pre-configured API key in `js/config.js` for testing purposes.

#### Option B: Using your own API key (Recommended for production)

1. Get a free API key from [RapidAPI Deezer API](https://rapidapi.com/deezerdevs/api/deezer-1)
2. Copy `js/config.example.js` to `js/config.js`:
   ```bash
   cp js/config.example.js js/config.js
   ```
3. Open `js/config.js` and replace `YOUR_RAPIDAPI_KEY_HERE` with your actual API key
4. The file is already in `.gitignore` so your key won't be committed to git

### 2. Running the Application

Simply open `index.html` in a web browser:

```bash
# Using Python's built-in server (recommended)
python -m http.server 8000

# Or using Node.js http-server
npx http-server

# Or just open the file directly
open index.html  # macOS
start index.html # Windows
xdg-open index.html # Linux
```

Then navigate to `http://localhost:8000` in your browser.

## ⚙️ Configuration Options

All configuration options are in `js/config.js`:

```javascript
const CONFIG = {
  // API Configuration
  RAPIDAPI_KEY: 'your-api-key-here',
  RAPIDAPI_HOST: 'deezerdevs-deezer.p.rapidapi.com',
  SEARCH_LIMIT: 10,
  
  // UI Settings
  ERROR_DISPLAY_DURATION: 5000,      // milliseconds
  SEARCH_DEBOUNCE_DELAY: 300,        // milliseconds
  SCROLL_THRESHOLD: 100,             // pixels
};
```

### Available Settings:

- **SEARCH_LIMIT**: Number of tracks to return from API (default: 10)
- **ERROR_DISPLAY_DURATION**: How long error messages display (default: 5000ms)
- **SEARCH_DEBOUNCE_DELAY**: Delay for debounced search (default: 300ms)
- **SCROLL_THRESHOLD**: Scroll position before showing back-to-top button (default: 100px)

## 🎮 Keyboard Shortcuts

Music Explorer supports keyboard shortcuts for enhanced user experience:

| Key | Action |
|-----|--------|
| `Space` | Play/Pause currently playing track |
| `↑` (Arrow Up) | Increase volume by 10% |
| `↓` (Arrow Down) | Decrease volume by 10% |
| `M` | Toggle mute |
| `Esc` | Stop playing track |

**Note**: Keyboard shortcuts only work when not typing in input fields.

## 🎨 Features

### Theme Persistence
- Your theme preference (light/dark) is automatically saved to `localStorage`
- The app will remember your choice on future visits

### State Management
- Centralized state management through `AppState` object
- Proper audio cleanup when switching tracks
- No memory leaks from unmanaged resources

### Search Enhancements
- Clear search button (×) appears when typing
- Debounced search function available for future live-search feature
- Proper loading states and error handling

### Audio Player
- Single-track playback (stops previous when playing new)
- Volume controls with slider and mute button
- Progress bar with time display
- Proper cleanup on track end

## 🔒 Security Notes

### Client-Side API Key Visibility
⚠️ **Important**: Since this is a client-side application, the API key will always be visible in the browser's network inspector, regardless of configuration methods.

For production applications, consider:
1. Using a backend proxy to hide API keys
2. Implementing rate limiting on your backend
3. Using API key restrictions (domain/IP whitelisting) on RapidAPI
4. Monitoring API usage for unusual patterns

### Best Practices Implemented:
- ✅ API key in separate config file
- ✅ Config file excluded from git via `.gitignore`
- ✅ Example config file provided for setup
- ✅ Clear documentation on security limitations

## 🛠️ Development

### File Structure
```
Project-2/
├── index.html              # Main HTML file
├── css/
│   └── style.css          # All styles
├── js/
│   ├── config.js          # Configuration (gitignored)
│   ├── config.example.js  # Config template
│   ├── api.js             # API communication
│   └── main.js            # Main application logic
├── assets/                 # Images and screenshots
├── .gitignore             # Git ignore rules
├── README.md              # Project documentation
└── SETUP.md               # This file
```

### Code Architecture

**State Management**: Centralized in `AppState` object
```javascript
AppState = {
  currentTracks: [],
  isSearching: false,
  isDarkTheme: true,
  currentlyPlayingAudio: null
}
```

**API Communication**: Handled by `MusicAPI` class
```javascript
musicAPI.searchTracks(query) // Returns Promise<Track[]>
```

**Configuration**: Global `CONFIG` object
```javascript
CONFIG.ERROR_DISPLAY_DURATION // Access config values
```

## 📝 Recent Improvements

### Version 2.0 Updates:

1. **Security**
   - Extracted API key to configuration file
   - Added proper `.gitignore` rules
   - Created config template for easy setup

2. **Code Quality**
   - Refactored global variables into `AppState`
   - Extracted magic numbers to `CONFIG`
   - Improved audio cleanup and resource management
   - Added proper error handling

3. **User Experience**
   - Theme preference persistence with `localStorage`
   - Clear search button
   - Keyboard shortcuts for playback control
   - Better visual feedback

4. **Performance**
   - Debouncing utility for search
   - Proper audio object cleanup
   - Optimized event listeners

## 🐛 Troubleshooting

### API Key Issues
**Problem**: "API key not configured" error
**Solution**: Ensure `js/config.js` exists and contains valid API key

### Audio Not Playing
**Problem**: Audio preview not working
**Solution**: Check browser console for CORS errors; try different browser

### Theme Not Persisting
**Problem**: Theme resets on page reload
**Solution**: Check browser's localStorage is not disabled

### Clear Button Not Appearing
**Problem**: × button not showing when typing
**Solution**: Clear browser cache and refresh

## 📚 Additional Resources

- [Deezer API Documentation](https://developers.deezer.com/api)
- [RapidAPI Deezer Endpoint](https://rapidapi.com/deezerdevs/api/deezer-1)
- [Web Audio API MDN Docs](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)

## 🤝 Contributing

If you'd like to contribute improvements:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

See LICENSE file for details.

