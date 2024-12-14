class MusicAPI {
  async searchTracks(query, limit = 10) {
    try {
      const response = await fetch(`https://cors-anywhere.herokuapp.com/https://api.deezer.com/search?q=${encodeURIComponent(query)}&limit=${limit}`);

      if (!response.ok) {
        throw new Error("HTTP status " + response.status);
      }

      const data = await response.json();
      console.log("API Response:", data); // Debug log
      return data.data;
    } catch (error) {
      console.error("Search Error:", error);
      throw error;
    }
  }
}

const musicAPI = new MusicAPI();
