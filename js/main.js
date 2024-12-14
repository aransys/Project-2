document.addEventListener("DOMContentLoaded", () => {
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

    document.querySelectorAll(".track-card").forEach((card) => {
      card.addEventListener("click", async () => {
        const previewUrl = card.dataset.previewUrl;
        const button = card.querySelector(".preview-button");
        const playIcon = card.querySelector(".play-icon");
        const progressContainer = card.querySelector(".progress-container");
        const progress = card.querySelector(".progress");

        // If there's already something playing, stop it
        if (currentlyPlaying) {
          currentlyPlaying.audio.pause();
          currentlyPlaying.card.classList.remove("playing", "loading");
          currentlyPlaying.button.textContent = "Preview";
          currentlyPlaying.playIcon.textContent = "▶";
          currentlyPlaying.progressContainer.classList.add("hidden");
          currentlyPlaying.progress.style.width = "0%";

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
          // Create audio and set up duration as soon as possible
          const audio = new Audio(previewUrl);

          // Wait for metadata to load before playing
          await new Promise((resolve) => {
            audio.addEventListener("loadedmetadata", () => {
              const duration = card.querySelector(".duration");
              duration.textContent = formatTime(audio.duration);
              resolve();
            });
          });

          await audio.play();
          clearTimeout(loadingTimeout);

          card.classList.remove("loading");
          card.classList.add("playing");
          button.textContent = "Stop";
          playIcon.textContent = "⏸";
          progressContainer.classList.remove("hidden");

          // Update progress and time
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
