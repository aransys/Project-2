document.addEventListener("DOMContentLoaded", () => {
  // Utility function to format time
  function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }

  // VOLUME CONTROL FUNCTION
  function createVolumeControl(audio) {
    // volume control container
    const volumeContainer = document.createElement("div");
    volumeContainer.className = "volume-control";

    // prevent clicks from bubbling up
    volumeContainer.onclick = (e) => e.stopPropagation();

    // volume slider
    const volumeSlider = document.createElement("input");
    volumeSlider.type = "range";
    volumeSlider.min = "0";
    volumeSlider.max = "1";
    volumeSlider.step = "0.01";
    volumeSlider.value = "0.5";
    volumeSlider.className = "volume-slider";
    volumeSlider.onclick = (e) => e.stopPropagation();

    // mute button
    const muteButton = document.createElement("button");
    muteButton.innerHTML = "🔊";
    muteButton.className = "mute-button";
    muteButton.onclick = (e) => e.stopPropagation();

    // Volume state variables
    let isMuted = false;
    let previousVolume = 0.5;

    // Mute/Unmute functionality
    muteButton.addEventListener("click", () => {
      if (isMuted) {
        // Unmute
        audio.volume = previousVolume;
        volumeSlider.value = previousVolume;
        muteButton.innerHTML = "🔊";
        isMuted = false;
      } else {
        // Mute
        previousVolume = audio.volume;
        audio.volume = 0;
        volumeSlider.value = 0;
        muteButton.innerHTML = "🔇";
        isMuted = true;
      }
    });

    // Volume slider event listener
    volumeSlider.addEventListener("input", (e) => {
      e.stopPropagation(); // Add this line
      const volume = parseFloat(e.target.value);
      audio.volume = volume;

      if (volume === 0) {
        muteButton.innerHTML = "🔇";
        isMuted = true;
      } else {
        muteButton.innerHTML = "🔊";
        isMuted = false;
      }
    });

    muteButton.addEventListener("click", (e) => {
      e.stopPropagation(); // Add this line
      if (isMuted) {
        audio.volume = previousVolume;
        volumeSlider.value = previousVolume;
        muteButton.innerHTML = "🔊";
        isMuted = false;
      } else {
        previousVolume = audio.volume;
        audio.volume = 0;
        volumeSlider.value = 0;
        muteButton.innerHTML = "🔇";
        isMuted = true;
      }
    });

    // Append elements to container
    volumeContainer.appendChild(muteButton);
    volumeContainer.appendChild(volumeSlider);

    return volumeContainer;
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
  function setupPreviewButtons() {
    let currentlyPlaying = null;
    let loadingTimeout = null;

    function formatTime(seconds) {
      const mins = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      return `${mins}:${secs.toString().padStart(2, "0")}`;
    }

    function createVolumeControl(audio) {
      const volumeContainer = document.createElement("div");
      volumeContainer.className = "volume-control";

      const volumeSlider = document.createElement("input");
      volumeSlider.type = "range";
      volumeSlider.min = "0";
      volumeSlider.max = "1";
      volumeSlider.step = "0.01";
      volumeSlider.value = "0.5";
      volumeSlider.className = "volume-slider";

      const muteButton = document.createElement("button");
      muteButton.innerHTML = "🔊";
      muteButton.className = "mute-button";

      let isMuted = false;
      let previousVolume = 0.5;

      muteButton.addEventListener("click", (e) => {
        if (isMuted) {
          audio.volume = previousVolume;
          volumeSlider.value = previousVolume;
          muteButton.innerHTML = "🔊";
          isMuted = false;
        } else {
          previousVolume = audio.volume;
          audio.volume = 0;
          volumeSlider.value = 0;
          muteButton.innerHTML = "🔇";
          isMuted = true;
        }
      });

      volumeSlider.addEventListener("input", (e) => {
        const volume = parseFloat(e.target.value);
        audio.volume = volume;

        if (volume === 0) {
          muteButton.innerHTML = "🔇";
          isMuted = true;
        } else {
          muteButton.innerHTML = "🔊";
          isMuted = false;
        }
      });

      volumeContainer.appendChild(muteButton);
      volumeContainer.appendChild(volumeSlider);

      return volumeContainer;
    }

    document.querySelectorAll(".track-card").forEach((card) => {
      const playButton = card.querySelector(".preview-button");
      const playOverlay = card.querySelector(".play-overlay");
      const imageArea = card.querySelector(".track-image");
      const trackInfo = card.querySelector(".track-info");

      const handlePlayPause = async () => {
        const previewUrl = card.dataset.previewUrl;
        const button = card.querySelector(".preview-button");
        const playIcon = card.querySelector(".play-icon");
        const progressContainer = card.querySelector(".progress-container");
        const progress = card.querySelector(".progress");

        // Remove existing volume control if it exists
        const existingVolumeControl = card.querySelector(".volume-control");
        if (existingVolumeControl) {
          existingVolumeControl.remove();
        }

        // If there's already something playing, stop it
        if (currentlyPlaying) {
          currentlyPlaying.audio.pause();
          currentlyPlaying.card.classList.remove("playing", "loading");
          currentlyPlaying.button.textContent = "Preview";
          currentlyPlaying.playIcon.textContent = "▶";
          currentlyPlaying.progressContainer.classList.add("hidden");
          currentlyPlaying.progress.style.width = "0%";

          const oldVolumeControl = currentlyPlaying.card.querySelector(".volume-control");
          if (oldVolumeControl) {
            oldVolumeControl.remove();
          }

          if (currentlyPlaying.card === card) {
            currentlyPlaying = null;
            return;
          }
        }

        if (loadingTimeout) {
          clearTimeout(loadingTimeout);
        }

        loadingTimeout = setTimeout(() => {
          card.classList.add("loading");
          button.textContent = "Loading...";
        }, 200);

        try {
          const audio = new Audio(previewUrl);
          audio.volume = 0.5; // Set initial volume

          await new Promise((resolve) => {
            audio.addEventListener("loadedmetadata", () => {
              const duration = card.querySelector(".duration");
              duration.textContent = formatTime(audio.duration);
              resolve();
            });
          });

          await audio.play();
          clearTimeout(loadingTimeout);

          // Create and add volume control
          const volumeControl = createVolumeControl(audio);
          card.querySelector(".progress-container").after(volumeControl);

          card.classList.remove("loading");
          card.classList.add("playing");
          button.textContent = "Stop";
          playIcon.textContent = "⏸";
          progressContainer.classList.remove("hidden");

          audio.addEventListener("timeupdate", () => {
            const percentage = (audio.currentTime / audio.duration) * 100;
            progress.style.width = `${percentage}%`;

            const currentTime = card.querySelector(".current-time");
            currentTime.textContent = formatTime(audio.currentTime);
          });

          currentlyPlaying = {
            audio,
            card,
            button,
            playIcon,
            progressContainer,
            progress,
          };

          audio.onended = () => {
            card.classList.remove("playing", "loading");
            button.textContent = "Preview";
            playIcon.textContent = "▶";
            progressContainer.classList.add("hidden");
            progress.style.width = "0%";

            const volumeControl = card.querySelector(".volume-control");
            if (volumeControl) {
              volumeControl.remove();
            }

            currentlyPlaying = null;
          };
        } catch (error) {
          console.error("Playback failed:", error);
          clearTimeout(loadingTimeout);
          card.classList.remove("loading", "playing");
          button.textContent = "Preview";
          playIcon.textContent = "▶";
          progressContainer.classList.add("hidden");
          progress.style.width = "0%";
        }
      };

      // Add click listeners to specific elements instead of the whole card
      playButton.addEventListener("click", (e) => {
        e.stopPropagation();
        handlePlayPause();
      });

      playOverlay.addEventListener("click", (e) => {
        e.stopPropagation();
        handlePlayPause();
      });
      imageArea.addEventListener("click", (e) => {
        e.stopPropagation();
        handlePlayPause();
      });
      trackInfo.addEventListener("click", (e) => {
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
