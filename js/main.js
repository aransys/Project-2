// Wait for the page to load
document.addEventListener("DOMContentLoaded", () => {
  // We'll use this to track if search is in progress
  let isSearching = false;

  // Get our DOM elements
  const searchForm = document.createElement("form");
  searchForm.innerHTML = `
        <input type="text" id="search-input" placeholder="Search for a song...">
        <button type="submit">Search</button>
    `;

  // Add the form to our search section
  document.getElementById("search-section").appendChild(searchForm);

  // Handle form submission
  searchForm.addEventListener("submit", async (e) => {
    e.preventDefault(); // Prevent page reload

    if (isSearching) return; // Don't search if already searching

    const searchInput = document.getElementById("search-input");
    const query = searchInput.value.trim();

    if (!query) return; // Don't search if empty

    try {
      isSearching = true;
      const tracks = await spotifyAPI.searchTracks(query);
      console.log("Found tracks:", tracks);
      // We'll add display logic here later
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      isSearching = false;
    }
  });
});
