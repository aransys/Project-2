// api.js

class SpotifyAPI {
  constructor() {
    this.accessToken = null;
    this.tokenType = null;
  }

  async authenticate() {
    try {
      const response = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: "Basic " + btoa(config.CLIENT_ID + ":" + config.CLIENT_SECRET),
        },
        body: "grant_type=client_credentials",
      });

      if (!response.ok) {
        throw new Error("HTTP status " + response.status);
      }

      const data = await response.json();
      this.accessToken = data.access_token;
      this.tokenType = data.token_type;
    } catch (error) {
      console.error("Authentication Error:", error);
      throw error;
    }
  }

  async searchTracks(query, limit = 10) {
    if (!this.accessToken) {
      await this.authenticate();
    }

    try {
      const response = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=${limit}`, {
        headers: {
          Authorization: `${this.tokenType} ${this.accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error("HTTP status " + response.status);
      }

      const data = await response.json();
      return data.tracks.items;
    } catch (error) {
      console.error("Search Error:", error);
      throw error;
    }
  }
}

// Create and export an instance
const spotifyAPI = new SpotifyAPI();
