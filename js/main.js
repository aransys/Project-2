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
        resultsGrid.innerHTML = '';
    
        tracks.forEach(track => {
            const trackCard = document.createElement('article');
            trackCard.className = 'track-card';
            
            const albumImage = track.album.images[0]?.url || 'https://via.placeholder.com/200';
            
            // Force preview button for now, we'll handle the preview URL in the click handler
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
                    <button class="preview-button" 
                        data-preview-url="${track.preview_url || ''}"
                        data-spotify-url="${track.external_urls.spotify}">
                        Preview
                    </button>
                </div>
            `;
    
            resultsGrid.appendChild(trackCard);
        });
    
        setupPreviewButtons();
    }

    let currentlyPlaying = {
        audio: null,
        button: null
    };
    // function to handle preview functionality
    function setupPreviewButtons() {
        document.querySelectorAll('.preview-button').forEach(button => {
            button.addEventListener('click', () => {
                const previewUrl = button.dataset.previewUrl;
                const spotifyUrl = button.dataset.spotifyUrl;
                
                // If no preview URL available, open in Spotify
                if (!previewUrl) {
                    window.open(spotifyUrl, '_blank');
                    return;
                }
    
                // If something is already playing, stop it
                if (currentlyPlaying.audio) {
                    currentlyPlaying.audio.pause();
                    currentlyPlaying.button.textContent = 'Preview';
                    currentlyPlaying.button.classList.remove('playing');
                    
                    // If clicking the same button that's playing, just stop
                    if (currentlyPlaying.button === button) {
                        currentlyPlaying = { audio: null, button: null };
                        return;
                    }
                }
    
                // Play the new preview
                const audio = new Audio(previewUrl);
                button.textContent = 'Stop';
                button.classList.add('playing');
                
                currentlyPlaying = { audio, button };
                audio.play().catch(error => {
                    console.error('Playback failed:', error);
                    // If playback fails, open in Spotify
                    window.open(spotifyUrl, '_blank');
                    button.textContent = 'Preview';
                    button.classList.remove('playing');
                    currentlyPlaying = { audio: null, button: null };
                });
                
                // When audio ends
                audio.onended = () => {
                    button.textContent = 'Preview';
                    button.classList.remove('playing');
                    currentlyPlaying = { audio: null, button: null };
                };
            });
        });
    }

    // Fetch data from the Spotify API
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