// Configuration file template
// Copy this file to config.js and add your actual API key

const CONFIG = {
  // Get your free API key from: https://rapidapi.com/deezerdevs/api/deezer-1
  RAPIDAPI_KEY: 'YOUR_RAPIDAPI_KEY_HERE',
  RAPIDAPI_HOST: 'deezerdevs-deezer.p.rapidapi.com',
  
  // API Settings
  SEARCH_LIMIT: 10,
  
  // UI Settings
  ERROR_DISPLAY_DURATION: 5000, // milliseconds
  SEARCH_DEBOUNCE_DELAY: 300, // milliseconds
  SCROLL_THRESHOLD: 100, // pixels before showing back-to-top button
};

// Make CONFIG available globally
if (typeof window !== 'undefined') {
  window.CONFIG = CONFIG;
}

