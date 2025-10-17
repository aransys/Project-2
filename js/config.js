// Configuration file
// IMPORTANT: This file contains your API key and should NOT be committed to git
// Add this file to .gitignore

const CONFIG = {
  // RapidAPI Configuration
  RAPIDAPI_KEY: '18246259eamsh6f81aaf5017de43p17f3f5jsnf02db3f3d57b',
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

