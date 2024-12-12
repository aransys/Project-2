document.addEventListener('DOMContentLoaded', () => {
    let isSearching = false;

    // Get our form reference
    const searchForm = document.getElementById('search-form');

    // Function to display tracks
    function displayTracks(tracks) {
        const resultsGrid = document.querySelector('.results-grid');
        resultsGrid.innerHTML = ''; // Clear existing results

        tracks.forEach(track => {
            const trackCard = document.createElement('article');
            trackCard.className = 'track-card';
            
            const albumImage = track.album.images[0]?.url || 'https://via.placeholder.com/200';
            
            trackCard.innerHTML = `
                <div class="track-image">
                    <img src="${albumImage}" alt="${track.name} album art">
                </div>
                <div class="track-info">
                    <h3 class="track-name">${track.name}</h3>
                    <p class="artist-name">${track.artists[0].name}</p>
                    <p class="album-name">${track.album.name}</p>
                </div>
                <div class="track-actions">
                    <button class="preview-button">Preview</button>
                </div>
            `;

            resultsGrid.appendChild(trackCard);
        });
    }

    // Form submission handler
    searchForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        if (isSearching) return;
        
        const searchInput = document.getElementById('search-input');
        const query = searchInput.value.trim();
        
        if (!query) return;

        const loadingSpinner = document.querySelector('.loading-spinner');
        const resultsGrid = document.querySelector('.results-grid');

        try {
            isSearching = true;
            // Show spinner, hide results
            loadingSpinner.classList.remove('hidden');
            resultsGrid.classList.add('hidden');

            const tracks = await spotifyAPI.searchTracks(query);
            displayTracks(tracks);
        } catch (error) {
            console.error('Search failed:', error);
        } finally {
            isSearching = false;
            // Hide spinner, show results
            loadingSpinner.classList.add('hidden');
            resultsGrid.classList.remove('hidden');
        }
    });
});