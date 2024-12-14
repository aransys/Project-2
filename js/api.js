class MusicAPI {
  async searchTracks(query, limit = 10) {
      try {
          const response = await fetch(
              `https://deezerdevs-deezer.p.rapidapi.com/search?q=${encodeURIComponent(query)}`,
              {
                  headers: {
                      'X-RapidAPI-Key': config.RAPID_API_KEY,
                      'X-RapidAPI-Host': 'deezerdevs-deezer.p.rapidapi.com'
                  }
              }
          );

          if (!response.ok) {
              throw new Error('HTTP status ' + response.status);
          }

          const data = await response.json();
          console.log('API Response:', data);
          return data.data;
      } catch (error) {
          console.error('Search Error:', error);
          throw error;
      }
  }
}

const musicAPI = new MusicAPI();