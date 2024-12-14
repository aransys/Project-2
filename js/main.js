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
      // Debug logs
      console.log("Track Name:", track.name);
      console.log("Has Preview URL:", !!track.preview_url);
      console.log("Preview URL:", track.preview_url);
      console.log("-------------------");

      const trackCard = document.createElement("article");
      trackCard.className = "track-card";

      const albumImage = track.album.images[0]?.url || "https://via.placeholder.com/200";

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
                            data-preview-url="${track.preview_url || ""}"
                            data-spotify-url="${track.external_urls.spotify}">
                        ${track.preview_url ? "Preview" : "Open in Spotify"}
                    </button>
                </div>
            `;

      resultsGrid.appendChild(trackCard);
    });

    setupPreviewButtons();
  }

  // Handle preview functionality
  function setupPreviewButtons() {
    let currentlyPlaying = null;

    document.querySelectorAll(".preview-button").forEach((button) => {
      button.addEventListener("click", () => {
        const previewUrl = button.dataset.previewUrl;
        const spotifyUrl = button.dataset.spotifyUrl;

        console.log("Button clicked");
        console.log("Preview URL:", previewUrl);
        console.log("Spotify URL:", spotifyUrl);

        if (!previewUrl) {
          window.open(spotifyUrl, "_blank");
          return;
        }

        // Handle currently playing audio
        if (currentlyPlaying) {
          currentlyPlaying.audio.pause();
          currentlyPlaying.button.textContent = "Preview";
          if (currentlyPlaying.button === button) {
            currentlyPlaying = null;
            return;
          }
        }

        // Play new audio
        const audio = new Audio(previewUrl);
        button.textContent = "Stop";

        audio.play().catch((error) => {
          console.error("Playback failed:", error);
          window.open(spotifyUrl, "_blank");
          button.textContent = "Preview";
        });

        currentlyPlaying = { audio, button };

        audio.onended = () => {
          button.textContent = "Preview";
          currentlyPlaying = null;
        };
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

      const tracks = await spotifyAPI.searchTracks(query);

      if (tracks.length === 0) {
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
