// main.js
// Inspired by Spotify Web API documentation and common JavaScript patterns
// for handling API responses and DOM manipulation
// Reference: https://developer.spotify.com/documentation/web-api

document.addEventListener("DOMContentLoaded", () => {
  let isSearching = false;

  // getting the form
  const searchForm = document.getElementById("search-form");

  // Function to create track cards - Layout structure inspired by Spotify's design patterns
  function displayTracks(tracks) {
    const resultsGrid = document.querySelector(".results-grid");
    resultsGrid.innerHTML = ""; // Clear existing results

    tracks.forEach((track) => {
      // Card element creation based on our HTML template structure
      const trackCard = document.createElement("article");
      trackCard.className = "track-card";

      // Get the first album image, or use a placeholder
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
                  <button class="preview-button">Preview</button>
              </div>
          `;

      resultsGrid.appendChild(trackCard);
    });
  }

  // Form submission handler
  searchForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (isSearching) return;

    const searchInput = document.getElementById("search-input");
    const query = searchInput.value.trim();

    if (!query) return;

    try {
      isSearching = true;
      const tracks = await spotifyAPI.searchTracks(query);
      displayTracks(tracks);
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      isSearching = false;
    }
  });
});
