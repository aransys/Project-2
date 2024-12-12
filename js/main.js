document.addEventListener('DOMContentLoaded', () => {
    let isSearching = false;

    // Get our form reference
    const searchForm = document.getElementById('search-form');

    // Error handling function
    function showError(message) {
        const errorContainer = document.getElementById('error-container');
        const errorText = document.getElementById('error-text');
        
        errorText.textContent = message;
        errorContainer.classList.remove('hidden');

        // Auto-hide after 5 seconds
        setTimeout(() => {
            errorContainer.classList.add('hidden');
        }, 5000);
    }

    // Add click handler for close button
    document.querySelector('.error-close').addEventListener('click', () => {
        document.getElementById('error-container').classList.add('hidden');
    });

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
        
        if (isSearching) {
            showError('A search is already in progress. Please wait...');
            return;
        }
        
        const searchInput = document.getElementById('search-input');
        const query = searchInput.value.trim();
        
        if (!query) {
            showError('Please enter a search term');
            return;
        }

        const loadingSpinner = document.querySelector('.loading-spinner');
        const resultsGrid = document.querySelector('.results-grid');

        try {
            isSearching = true;
            loadingSpinner.classList.remove('hidden');
            resultsGrid.classList.add('hidden');

            const tracks = await spotifyAPI.searchTracks(query);
            
            if (tracks.length === 0) {
                showError('No tracks found. Try a different search term.');
                return;
            }

            displayTracks(tracks);
        } catch (error) {
            console.error('Search failed:', error);
            showError('Something went wrong. Please try again later.');
        } finally {
            isSearching = false;
            loadingSpinner.classList.add('hidden');
            resultsGrid.classList.remove('hidden');
        }
    });
});