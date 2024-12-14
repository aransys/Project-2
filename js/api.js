class SpotifyAPI {
  constructor() {
    this.accessToken = null;
    this.tokenType = null;
  }

  async authenticate() {
    try {
      console.log("Starting authentication...");
      const authString = btoa(config.CLIENT_ID + ":" + config.CLIENT_SECRET);

      const response = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: "Basic " + authString,
        },
        // Adding scope for streaming and user-read-playback-state
        body: "grant_type=client_credentials&scope=streaming user-read-playback-state",
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error("Auth error response:", errorData);
        throw new Error("HTTP status " + response.status);
      }

      const data = await response.json();
      this.accessToken = data.access_token;
      this.tokenType = data.token_type;
      console.log("Authentication successful");
    } catch (error) {
      console.error("Authentication Error:", error);
      throw error;
    }
  }

  async searchTracks(query, limit = 10) {
    try {
      await this.authenticate();

      const response = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=50`, {
        headers: {
          Authorization: `${this.tokenType} ${this.accessToken}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error("Search error response:", errorData);
        throw new Error("HTTP status " + response.status);
      }

      const data = await response.json();
      console.log("Search results:", data.tracks.items);
      return data.tracks.items.slice(0, limit);
    } catch (error) {
      console.error("Search Error:", error);
      throw error;
    }
  }
}

const spotifyAPI = new SpotifyAPI();
