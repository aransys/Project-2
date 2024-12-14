class MusicAPI {
    constructor() {
        this.count = 0;
    }

    async searchTracks(query, limit = 10) {
        try {
            console.log('Starting API request...');
            const apiKey = config.RAPID_API_KEY;

            const url = `https://deezerdevs-deezer.p.rapidapi.com/search?q=${encodeURIComponent(query)}`;
            
            const options = {
                method: 'GET',
                headers: {
                    'X-RapidAPI-Key': apiKey,
                    'X-RapidAPI-Host': 'deezerdevs-deezer.p.rapidapi.com'
                }
            };

            const response = await fetch(url, options);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Error response:', errorText);
                throw new Error(`HTTP status ${response.status}: ${errorText}`);
            }

            const data = await response.json();
            console.log('First track data:', data.data[0]);
            return data.data;
        } catch (error) {
            console.error('Detailed error:', error);
            throw error;
        }
    }
}

const musicAPI = new MusicAPI();