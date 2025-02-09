document.addEventListener("DOMContentLoaded", () => {
  // Add search link functionality
  document.querySelector('a[href="#search"]').addEventListener('click', (e) => {
    e.preventDefault();
    
    // Find the search input
    const searchInput = document.getElementById('search-input');
    
    // Scroll to the search input smoothly
    searchInput.scrollIntoView({ behavior: 'smooth' });
    
    // Focus the input after scrolling
    setTimeout(() => {
      searchInput.focus();
    }, 500);
    
    // Close mobile menu if open
    hamburger.classList.remove("active");
    navLinks.classList.remove("active");
  });

  // Theme toggle functionality
  const themeToggle = document.querySelector(".theme-toggle");
  let isDarkTheme = true;

  themeToggle.addEventListener("click", () => {
    isDarkTheme = !isDarkTheme;
    if (isDarkTheme) {
      document.documentElement.removeAttribute("data-theme");
      themeToggle.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
            </svg>
        `;
    } else {
      document.documentElement.setAttribute("data-theme", "light");
      themeToggle.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="5"></circle>
                <line x1="12" y1="1" x2="12" y2="3"></line>
                <line x1="12" y1="21" x2="12" y2="23"></line>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                <line x1="1" y1="12" x2="3" y2="12"></line>
                <line x1="21" y1="12" x2="23" y2="12"></line>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
            </svg>
        `;
    }
  });

  // Sorting functionality
  let currentTracks = []; // Store current tracks for sorting

  const sortSelect = document.getElementById("sort-select");
  sortSelect.addEventListener("change", () => {
    const sortType = sortSelect.value;

    if (sortType === "default") {
      renderTracks(currentTracks);
      return;
    }

    const sortedTracks = [...currentTracks].sort((a, b) => {
      switch (sortType) {
        case "title":
          return a.title.localeCompare(b.title);
        case "artist":
          return a.artist.name.localeCompare(b.artist.name);
        case "duration":
          return a.duration - b.duration;
        default:
          return 0;
      }
    });

    renderTracks(sortedTracks);
  });

  // Utility function to format time
  function formatTime(seconds) {
    if (!seconds || isNaN(seconds)) return "0:00";
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
      },
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
    currentTracks = [...tracks]; // Store tracks for sorting
    renderTracks(tracks);
  }

  // RENDER TRACKS FUNCTRION
  function renderTracks(tracks) {
    const resultsGrid = document.querySelector(".results-grid");
    const sortContainer = document.querySelector(".sort-container");
    if (!resultsGrid) return;

    resultsGrid.innerHTML = "";
    sortContainer.classList.remove("hidden");

    tracks.forEach((track) => {
      const trackCard = document.createElement("article");
      trackCard.className = "track-card";
      trackCard.dataset.previewUrl = track.preview || "";

      const duration = track.duration || 0;
      const formattedDuration = formatTime(duration);

      trackCard.innerHTML = `
  <div class="track-card-inner">
      <div class="track-image">
          <img src="${track.album?.cover_medium || track.album?.cover || ""}" 
               alt="${track.title} album art">
          <div class="play-overlay">
              <span class="play-icon">▶</span>
              <div class="loading-ring"></div>
          </div>
      </div>
      
      <div class="track-info">
          <h3 class="track-name">${track.title || "Unknown Title"}</h3>
          <p class="artist-name">${track.artist?.name || "Unknown Artist"}</p>
          <p class="album-name">${track.album?.title || "Unknown Album"}</p>
          <div class="track-actions">
              <button class="preview-button">Preview</button>
          </div>
      </div>
      
      <div class="track-controls">
          <div class="progress-container">
              <div class="time-info">
                  <span class="current-time">0:00</span>
                  <span class="duration">-${formattedDuration}</span>
              </div>
              <div class="progress-bar">
                  <div class="progress"></div>
              </div>
          </div>
      </div>
  </div>`;

      resultsGrid.appendChild(trackCard);
    });

    setupPreviewButtons();
  }

  // Handle preview functionality
  // SETUP PREVIEW BUTTON FUNCTION
  function setupPreviewButtons() {
    let currentlyPlaying = null;

    document.querySelectorAll(".track-card").forEach((card) => {
      const playButton = card.querySelector(".preview-button");
      const playOverlay = card.querySelector(".play-overlay");
      const imageArea = card.querySelector(".track-image");
      const trackInfo = card.querySelector(".track-info");

      const handlePlayPause = async () => {
        const previewUrl = card.dataset.previewUrl;
        const playIcon = card.querySelector(".play-icon");
        const progressContainer = card.querySelector(".progress-container");
        const progress = card.querySelector(".progress");
        const timeInfo = card.querySelector(".time-info");

        // If there's already something playing, stop it
        if (currentlyPlaying) {
          currentlyPlaying.audio.pause();
          currentlyPlaying.card.classList.remove("playing", "loading");

          // Reset previous card's UI
          const oldPlayIcon = currentlyPlaying.card.querySelector(".play-icon");
          if (oldPlayIcon) oldPlayIcon.textContent = "▶";

          // Remove volume controls from previous card
          const oldVolumeControl = currentlyPlaying.card.querySelector(".player-controls");
          if (oldVolumeControl) oldVolumeControl.remove();

          if (currentlyPlaying.card === card) {
            currentlyPlaying = null;
            return;
          }
        }

        try {
          const audio = new Audio(previewUrl);
          audio.volume = 0.5;

          // Add volume controls
          const { controlsContainer, muteHandler } = createVolumeControl(audio);
          const existingControls = card.querySelector(".player-controls");
          if (existingControls) existingControls.remove();
          progressContainer.after(controlsContainer);

          // Add mute button
          const muteButton = document.createElement("button");
          muteButton.className = "mute-button";
          muteButton.textContent = "🔊";
          controlsContainer.appendChild(muteButton);

          muteButton.addEventListener("click", (e) => {
            const newIcon = muteHandler(e);
            muteButton.textContent = newIcon;
          });

          await audio.play();

          // Update UI for playing state
          card.classList.add("playing");
          playIcon.textContent = "⏸";

          // Update time displays
          audio.addEventListener("timeupdate", () => {
            const percentage = (audio.currentTime / audio.duration) * 100;
            progress.style.width = `${percentage}%`;

            const currentTime = card.querySelector(".current-time");
            const duration = card.querySelector(".duration");

            currentTime.textContent = formatTime(audio.currentTime);
            const remainingTime = audio.duration - audio.currentTime;
            duration.textContent = `-${formatTime(remainingTime)}`;
          });

          currentlyPlaying = {
            audio,
            card,
            playIcon,
            progressContainer,
            progress,
          };

          // Handle track ending
          audio.onended = () => {
            card.classList.remove("playing");
            playIcon.textContent = "▶";
            progress.style.width = "0%";

            // Reset time displays
            const currentTime = card.querySelector(".current-time");
            if (currentTime) currentTime.textContent = "0:00";

            // Remove volume controls
            const volumeControl = card.querySelector(".player-controls");
            if (volumeControl) volumeControl.remove();

            currentlyPlaying = null;
          };
        } catch (error) {
          console.error("Playback failed:", error);
          card.classList.remove("playing");
          playIcon.textContent = "▶";
          progress.style.width = "0%";
          currentlyPlaying = null;
        }
      };

      // Add click event listeners
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

  // FORM SUBMISSION HANDLER
  searchForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    sortSelect.value = "default";

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
