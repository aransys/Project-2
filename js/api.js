class MusicAPI {
  async searchTracks(query, limit = 10) {
    try {
      // Using Deezer's search API
      const response = await fetch(`https://api.deezer.com/search?q=${encodeURIComponent(query)}&limit=${limit}`);

      if (!response.ok) {
        throw new Error("HTTP status " + response.status);
      }

      const data = await response.json();
      return data.data; // Deezer returns results in data array
    } catch (error) {
      console.error("Search Error:", error);
      throw error;
    }
  }
}

const musicAPI = new MusicAPI();
