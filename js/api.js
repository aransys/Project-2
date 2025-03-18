// MusicAPI class for handling Deezer API requests
class MusicAPI {
  // Search for tracks using Deezer API
  async searchTracks(query, limit = 10) {
    try {
      console.log("Starting API request...");

      // Make API request to Deezer through RapidAPI
      const response = await fetch(`https://deezerdevs-deezer.p.rapidapi.com/search?q=${encodeURIComponent(query)}`, {
        headers: {
          "X-RapidAPI-Key": "18246259eamsh6f81aaf5017de43p17f3f5jsnf02db3f3d57b",
          "X-RapidAPI-Host": "deezerdevs-deezer.p.rapidapi.com",
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
