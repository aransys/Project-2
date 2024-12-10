// Define initMap in global scope so Google Maps can find it
function initMap() {
  // London coordinates
  const defaultLocation = { lat: 51.5074, lng: -0.1278 };

  // Create the map
  const map = new google.maps.Map(document.getElementById("map"), {
    center: defaultLocation,
    zoom: 13,
  });
}

// Add event listeners after DOM loads
document.addEventListener("DOMContentLoaded", function () {
  const searchInput = document.getElementById("search");
  const searchButton = document.getElementById("searchButton");

  searchButton.addEventListener("click", function () {
    const searchTerm = searchInput.value;
    if (searchTerm) {
      console.log("Searching for:", searchTerm);
    }
  });
});
