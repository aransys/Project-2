document.addEventListener("DOMContentLoaded", () => {
  // Utility function to format time
  function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }

  // VOLUME CONTROL FUNCTION
  function createVolumeControl(audio) {
    const controlsContainer = document.createElement("div");
    controlsContainer.className = "player-controls";

    const volumeSlider = document.createElement("input");
    volumeSlider.type = "range";
    volumeSlider.min = "0";
    volumeSlider.max = "1";
    volumeSlider.step = "0.01";
    volumeSlider.value = "0.5";
    volumeSlider.className = "volume-slider";

    let isMuted = false;
    let previousVolume = 0.5;

    volumeSlider.addEventListener("input", (e) => {
        e.stopPropagation();
        const volume = parseFloat(e.target.value);
        audio.volume = volume;
        previousVolume = volume;
    });

    controlsContainer.appendChild(volumeSlider);

    return { 
        controlsContainer,
        muteHandler: (e) => {
            e.stopPropagation();
            if (isMuted) {
                audio.volume = previousVolume;
                volumeSlider.value = previousVolume;
                isMuted = false;
                return "🔊";
            } else {
                previousVolume = audio.volume;
                audio.volume = 0;
                volumeSlider.value = 0;
                isMuted = true;
                return "🔇";
            }
        }
    };
}
  // Hamburger menu
  const hamburger = document.querySelector(".hamburger");
  const navLinks = document.querySelector(".nav-links");

  hamburger.addEventListener("click", () => {
    hamburger.classList.toggle("active");
    navLinks.classList.toggle("active");
  });

  // Close menu when clicking a link
  document.querySelectorAll(".nav-links a").forEach((link) => {
    link.addEventListener("click", () => {
      hamburger.classList.remove("active");
      navLinks.classList.remove("active");
    });
  });

  let isSearching = false;

  // Get our form reference
  const searchForm = document.getElementById("search-form");

  // Error handling function
  function showError(message) {
    const errorContainer = document.getElementById("error-container");
    const errorText = document.getElementById("error-text");

    errorText.textContent = message;
    errorContainer.classList.remove("hidden");

    // Auto-hide after 5 seconds
    setTimeout(() => {
      errorContainer.classList.add("hidden");
    }, 5000);
  }

  // Add click handler for close button
  document.querySelector(".error-close").addEventListener("click", () => {
    document.getElementById("error-container").classList.add("hidden");
  });

  // Function to display tracks
  function displayTracks(tracks) {
    const resultsGrid = document.querySelector(".results-grid");
    if (!resultsGrid) return;

    resultsGrid.innerHTML = "";

    tracks.forEach((track) => {
      console.log("Processing track:", track.title); // Debug log

      const trackCard = document.createElement("article");
      trackCard.className = "track-card";
      trackCard.dataset.previewUrl = track.preview || ""; // Add fallback

      trackCard.innerHTML = `
    <div class="track-card-inner">
        <div class="track-image">
            <img src="${track.album.cover_medium || ""}" alt="${track.title} album art">
            <div class="play-overlay">
                <span class="play-icon">▶</span>
                <div class="loading-ring"></div>
            </div>
        </div>
        <div class="track-info">
            <h3 class="track-name">${track.title}</h3>
            <p class="artist-name">${track.artist.name}</p>
            <p class="album-name">${track.album.title}</p>
        </div>
        <div class="progress-container hidden">
            <div class="time-info">
                <span class="current-time">0:00</span>
                <span class="duration">-:--</span>
            </div>
            <div class="progress-bar">
                <div class="progress"></div>
            </div>
        </div>
        <div class="track-actions">
            <button class="preview-button">Preview</button>
        </div>
    </div>
`;

      resultsGrid.appendChild(trackCard);
    });

    setupPreviewButtons();
  }

  // Handle preview functionality
  // SETUP PREVIEW BUTTON FUNCTION
  function setupPreviewButtons() {
    let currentlyPlaying = null;
    let loadingTimeout = null;

    document.querySelectorAll(".track-card").forEach((card) => {
        const playButton = card.querySelector('.preview-button');
        const playOverlay = card.querySelector('.play-overlay');
        const imageArea = card.querySelector('.track-image');
        const trackInfo = card.querySelector('.track-info');
        const trackActions = card.querySelector('.track-actions');

        // Only show preview button initially
        trackActions.innerHTML = `
            <button class="preview-button">Preview</button>
        `;

        const handlePlayPause = async () => {
            const previewUrl = card.dataset.previewUrl;
            const button = card.querySelector('.preview-button');
            const playIcon = card.querySelector('.play-icon');
            const progressContainer = card.querySelector('.progress-container');
            const progress = card.querySelector('.progress');

            // Remove existing volume control if it exists
            const existingVolumeControl = card.querySelector('.player-controls');
            if (existingVolumeControl) {
                existingVolumeControl.remove();
            }

            // If there's already something playing, stop it
            if (currentlyPlaying) {
                currentlyPlaying.audio.pause();
                currentlyPlaying.card.classList.remove('playing', 'loading');
                
                // Recreate preview button for previously playing card
                const oldTrackActions = currentlyPlaying.card.querySelector('.track-actions');
                oldTrackActions.innerHTML = `
                    <button class="preview-button">Preview</button>
                `;
                
                currentlyPlaying.playIcon.textContent = "▶";
                currentlyPlaying.progressContainer.classList.add('hidden');
                currentlyPlaying.progress.style.width = '0%';
                
                // Remove mute button from previously playing card
                const oldMuteButton = currentlyPlaying.card.querySelector('.mute-button');
                if (oldMuteButton) oldMuteButton.remove();
                
                if (currentlyPlaying.card === card) {
                    currentlyPlaying = null;
                    return;
                }
            }

            if (loadingTimeout) {
                clearTimeout(loadingTimeout);
            }

            loadingTimeout = setTimeout(() => {
                card.classList.add('loading');
            }, 200);

            try {
                const audio = new Audio(previewUrl);
                audio.volume = 0.5;

                await new Promise((resolve) => {
                    audio.addEventListener('loadedmetadata', () => {
                        const duration = card.querySelector('.duration');
                        duration.textContent = `-${formatTime(audio.duration)}`;
                        resolve();
                    });
                });

                await audio.play();
                clearTimeout(loadingTimeout);

                // Remove preview button
                const previewButton = card.querySelector('.preview-button');
                if (previewButton) previewButton.remove();

                // Create volume control
                const { controlsContainer, muteHandler } = createVolumeControl(audio);
                card.querySelector('.progress-container').after(controlsContainer);

                // Add mute button after successful play
                const muteButton = document.createElement('button');
                muteButton.className = 'mute-button';
                muteButton.textContent = '🔊';
                trackActions.appendChild(muteButton);

                // Set up mute button handler
                muteButton.addEventListener('click', (e) => {
                    const newIcon = muteHandler(e);
                    muteButton.textContent = newIcon;
                });

                card.classList.remove('loading');
                card.classList.add('playing');
                playIcon.textContent = "⏸";
                progressContainer.classList.remove('hidden');

                audio.addEventListener('timeupdate', () => {
                    const percentage = (audio.currentTime / audio.duration) * 100;
                    progress.style.width = `${percentage}%`;
                    
                    const currentTime = card.querySelector('.current-time');
                    const duration = card.querySelector('.duration');
                    
                    currentTime.textContent = formatTime(audio.currentTime);
                    const remainingTime = audio.duration - audio.currentTime;
                    duration.textContent = `-${formatTime(remainingTime)}`;
                });

                currentlyPlaying = { 
                    audio, 
                    card, 
                    playIcon,
                    progressContainer,
                    progress
                };

                audio.onended = () => {
                    card.classList.remove('playing', 'loading');
                    
                    // Recreate preview button
                    trackActions.innerHTML = `
                        <button class="preview-button">Preview</button>
                    `;
                    
                    playIcon.textContent = "▶";
                    progressContainer.classList.add('hidden');
                    progress.style.width = '0%';
                    
                    const muteButton = card.querySelector('.mute-button');
                    if (muteButton) muteButton.remove();
                    
                    currentlyPlaying = null;

                    // Add click handler to new preview button
                    const newPreviewButton = card.querySelector('.preview-button');
                    if (newPreviewButton) {
                        newPreviewButton.addEventListener('click', (e) => {
                            e.stopPropagation();
                            handlePlayPause();
                        });
                    }
                };
            } catch (error) {
                console.error('Playback failed:', error);
                clearTimeout(loadingTimeout);
                card.classList.remove('loading', 'playing');
                
                // Ensure preview button is present
                if (!card.querySelector('.preview-button')) {
                    trackActions.innerHTML = `
                        <button class="preview-button">Preview</button>
                    `;
                }
                
                playIcon.textContent = "▶";
                progressContainer.classList.add('hidden');
                progress.style.width = '0%';
                
                const muteButton = card.querySelector('.mute-button');
                if (muteButton) muteButton.remove();
            }
        };

        // Add click handlers
        playButton.addEventListener('click', (e) => {
            e.stopPropagation();
            handlePlayPause();
        });
        
        playOverlay.addEventListener('click', (e) => {
            e.stopPropagation();
            handlePlayPause();
        });

        imageArea.addEventListener('click', (e) => {
            e.stopPropagation();
            handlePlayPause();
        });

        trackInfo.addEventListener('click', (e) => {
            e.stopPropagation();
            handlePlayPause();
        });
    });
}

  // Form submission handler
  searchForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (isSearching) {
      showError("A search is already in progress. Please wait...");
      return;
    }

    const searchInput = document.getElementById("search-input");
    const query = searchInput.value.trim();

    if (!query) {
      showError("Please enter a search term");
      return;
    }

    const loadingSpinner = document.querySelector(".loading-spinner");
    const resultsGrid = document.querySelector(".results-grid");

    try {
      isSearching = true;
      loadingSpinner.classList.remove("hidden");
      resultsGrid.classList.add("hidden");

      const tracks = await musicAPI.searchTracks(query);

      if (!tracks || tracks.length === 0) {
        showError("No tracks found. Try a different search term.");
        return;
      }

      displayTracks(tracks);
    } catch (error) {
      console.error("Search failed:", error);
      showError("Something went wrong. Please try again later.");
    } finally {
      isSearching = false;
      loadingSpinner.classList.add("hidden");
      resultsGrid.classList.remove("hidden");
    }
  });
});
