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
          const trackCard = document.createElement("article");
          trackCard.className = "track-card";
          trackCard.dataset.previewUrl = track.preview;

          trackCard.innerHTML = `
              <div class="track-card-inner">
                  <div class="track-image">
                      <img src="${track.album.cover_medium}" alt="${track.title} album art">
                      <div class="play-overlay">
                          <span class="play-icon">▶</span>
                      </div>
                  </div>
                  <div class="track-info">
                      <h3 class="track-name">${track.title}</h3>
                      <p class="artist-name">${track.artist.name}</p>
                      <p class="album-name">${track.album.title}</p>
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

      document.querySelectorAll(".track-card").forEach((card) => {
          card.addEventListener("click", () => {
              const previewUrl = card.dataset.previewUrl;
              const button = card.querySelector('.preview-button');
              const playIcon = card.querySelector('.play-icon');
              
              // If there's already something playing, stop it
              if (currentlyPlaying) {
                  currentlyPlaying.audio.pause();
                  currentlyPlaying.card.classList.remove('playing');
                  currentlyPlaying.button.textContent = "Preview";
                  currentlyPlaying.playIcon.textContent = "▶";
                  
                  if (currentlyPlaying.card === card) {
                      currentlyPlaying = null;
                      return;
                  }
              }

              // Play new audio
              const audio = new Audio(previewUrl);
              card.classList.add('playing');
              button.textContent = "Stop";
              playIcon.textContent = "⏸";
              
              audio.play().catch(error => {
                  console.error('Playback failed:', error);
                  card.classList.remove('playing');
                  button.textContent = "Preview";
                  playIcon.textContent = "▶";
              });

              currentlyPlaying = { audio, card, button, playIcon };

              // When audio ends
              audio.onended = () => {
                  card.classList.remove('playing');
                  button.textContent = "Preview";
                  playIcon.textContent = "▶";
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