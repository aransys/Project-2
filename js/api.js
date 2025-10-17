// MusicAPI class for handling Deezer API requests
class MusicAPI {
  constructor() {
    // Validate that CONFIG is loaded
    if (typeof CONFIG === 'undefined') {
      console.error('CONFIG not loaded! Make sure config.js is included before api.js');
    }
  }

  // Search for tracks using Deezer API
  async searchTracks(query, limit = CONFIG.SEARCH_LIMIT) {
    try {
      console.log("Starting API request...");

      // Validate API key is configured
      if (!CONFIG.RAPIDAPI_KEY || CONFIG.RAPIDAPI_KEY === 'YOUR_RAPIDAPI_KEY_HERE') {
        throw new Error('API key not configured. Please update js/config.js with your RapidAPI key.');
      }

      // Make API request to Deezer through RapidAPI
      const response = await fetch(`https://${CONFIG.RAPIDAPI_HOST}/search?q=${encodeURIComponent(query)}`, {
        headers: {
          "X-RapidAPI-Key": CONFIG.RAPIDAPI_KEY,
          "X-RapidAPI-Host": CONFIG.RAPIDAPI_HOST,
        },
      });

      // Check if request was successful
      if (!response.ok) {
        throw new Error("HTTP status " + response.status);
      }

      // Parse and return the track data
      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error("Detailed error:", error);
      throw error;
    }
  }
}

// Create global instance of MusicAPI
const musicAPI = new MusicAPI();
