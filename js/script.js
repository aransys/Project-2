// script.js
document.addEventListener("DOMContentLoaded", function () {
  // Get DOM elements
  const searchInput = document.getElementById("search");
  const searchButton = document.getElementById("searchButton");

  // Add click event to search button
  searchButton.addEventListener("click", function () {
    const searchTerm = searchInput.value;
    if (searchTerm) {
      alert("You searched for: " + searchTerm);
      // We'll add the actual search functionality later
    }
  });
});

// API key AIzaSyBdQIJwjRsPXRBeRsghd47w6_9NUIetTTA
