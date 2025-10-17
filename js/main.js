/* global document, window, setTimeout, Audio, console, musicAPI, CONFIG */

// Application State Management
const AppState = {
  currentTracks: [],
  isSearching: false,
  isDarkTheme: true,
  currentlyPlayingAudio: null,
  
  // Initialize state from localStorage
  init() {
    // Load theme preference from localStorage
    const savedTheme = localStorage.getItem('musicExplorerTheme');
    if (savedTheme) {
      this.isDarkTheme = savedTheme === 'dark';
    }
  },
  
  // Save theme preference to localStorage
  saveTheme() {
    localStorage.setItem('musicExplorerTheme', this.isDarkTheme ? 'dark' : 'light');
  },
};

// Utility function for debouncing
function debounce(func, delay) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
}

// Wait for DOM to be fully loaded before running
document.addEventListener("DOMContentLoaded", () => {
  // Initialize app state
  AppState.init();
  
  // Theme toggle setup
  const themeToggle = document.querySelector(".theme-toggle");
  
  // Apply saved theme on load
  if (!AppState.isDarkTheme) {
    document.documentElement.setAttribute("data-theme", "light");
  }

  // Function to update theme icon
  function updateThemeIcon() {
    if (AppState.isDarkTheme) {
      // Show sun icon for dark mode
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
    } else {
      // Show moon icon for light mode
      themeToggle.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
        </svg>
      `;
    }
  }

  // Set initial icon based on saved theme
  updateThemeIcon();

  // Handle theme toggle clicks
  themeToggle.addEventListener("click", () => {
    AppState.isDarkTheme = !AppState.isDarkTheme;
    
    if (!AppState.isDarkTheme) {
      document.documentElement.setAttribute("data-theme", "light");
    } else {
      document.documentElement.removeAttribute("data-theme");
    }
    
    updateThemeIcon();
    AppState.saveTheme();
  });

  // Contact form handling
  const contactForm = document.getElementById("contact-form");
  
  if (contactForm) {
    contactForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      
      // Get form values
      const name = document.getElementById("name-input").value.trim();
      const email = document.getElementById("email-input").value.trim();
      const message = document.getElementById("message-input").value.trim();
      
      // Basic validation
      if (!name || !email || !message) {
        showError("Please fill in all fields");
        return;
      }
      
      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        showError("Please enter a valid email address");
        return;
      }
      
      try {
        // In a real application, we would send the data to a server here
      
        // Show loading state
        const submitButton = contactForm.querySelector("button[type='submit']");
        const originalText = submitButton.textContent;
        submitButton.textContent = "Sending...";
        submitButton.disabled = true;
        
        // Simulate server delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Show success message
        showSuccessMessage();
        
        // Reset form
        contactForm.reset();
        
        // Reset button
        submitButton.textContent = originalText;
        submitButton.disabled = false;
        
      } catch (error) {
        console.error("Form submission error:", error);
        showError("Something went wrong. Please try again later.");
        
        // Reset button state
        const submitButton = contactForm.querySelector("button[type='submit']");
        submitButton.textContent = "Send";
        submitButton.disabled = false;
      }
    });
  }
  
  // Function to show success message
  function showSuccessMessage() {
    // Check if success message already exists
    let successMessage = document.querySelector(".success-message");
    
    // If not, create one
    if (!successMessage) {
      successMessage = document.createElement("div");
      successMessage.className = "success-message";
      successMessage.style.backgroundColor = "#2ecc71";
      successMessage.style.color = "white";
      successMessage.style.padding = "1rem";
      successMessage.style.marginTop = "1rem";
      successMessage.style.borderRadius = "8px";
      successMessage.style.textAlign = "center";
      successMessage.style.animation = "slideDown 0.3s ease-out";
      
      // Add success message after the form
      const contactForm = document.getElementById("contact-form");
      contactForm.parentNode.insertBefore(successMessage, contactForm.nextSibling);
    }
    
    // Update message content
    successMessage.textContent = "Thank you! Your message has been sent successfully.";
    
    // Auto-hide success message after configured duration
    setTimeout(() => {
      successMessage.remove();
    }, CONFIG.ERROR_DISPLAY_DURATION);
  }

});

// Handle sort selection changes
const sortSelect = document.getElementById("sort-select");
sortSelect.addEventListener("change", () => {
  const sortType = sortSelect.value;

  // Return to default order if selected
  if (sortType === "default") {
    renderTracks(AppState.currentTracks);
    return;
  }

  // Sort tracks based on selected criteria
  const sortedTracks = [...AppState.currentTracks].sort((a, b) => {
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

// Convert seconds to MM:SS format
function formatTime(seconds) {
  if (!seconds || isNaN(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

// Create volume control interface for audio player
function createVolumeControl(audio) {
  const controlsContainer = document.createElement("div");
  controlsContainer.className = "player-controls";

  // Create volume slider
  const volumeSlider = document.createElement("input");
  volumeSlider.type = "range";
  volumeSlider.min = "0";
  volumeSlider.max = "1";
  volumeSlider.step = "0.01";
  volumeSlider.value = "0.5";
  volumeSlider.className = "volume-slider";

  let isMuted = false;
  let previousVolume = 0.5;

  // Handle volume changes
  volumeSlider.addEventListener("input", (e) => {
    e.stopPropagation();
    const volume = parseFloat(e.target.value);
    audio.volume = volume;
    previousVolume = volume;
  });

  controlsContainer.appendChild(volumeSlider);

  // Return controls and mute handler
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

// Mobile menu functionality
const hamburger = document.querySelector(".hamburger");
const navLinks = document.querySelector(".nav-links");

hamburger.addEventListener("click", () => {
  hamburger.classList.toggle("active");
  navLinks.classList.toggle("active");
});

// Handle navigation link clicks
document.querySelectorAll(".nav-links a").forEach((link) => {
  link.addEventListener("click", (e) => {
    e.preventDefault();

    // Get target section
    const sectionId = e.target.getAttribute("href").substring(1);
    const targetSection = document.getElementById(sectionId);

    // Hide all sections
    document.querySelectorAll("section").forEach((section) => {
      section.classList.add("hidden");
    });

    // Show appropriate section
    if (sectionId === "results-section") {  // FIXED: Changed from "search" to match href
      const resultsSection = document.getElementById("results-section");
      resultsSection.classList.remove("hidden");
      document.getElementById("search-input").focus();
    } else if (targetSection) {
      // Animate section entrance
      targetSection.classList.remove("hidden");
      targetSection.classList.add("entering");
      void targetSection.offsetHeight;
      targetSection.classList.remove("entering");

      // Smooth scroll to section
      targetSection.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }

    // Close mobile menu
    hamburger.classList.remove("active");
    navLinks.classList.remove("active");
  });
});

const searchForm = document.getElementById("search-form");
const searchInput = document.getElementById("search-input");

// Display error messages
function showError(message) {
  const errorContainer = document.getElementById("error-container");
  const errorText = document.getElementById("error-text");

  errorText.textContent = message;
  errorContainer.classList.remove("hidden");

  // Auto-hide error after configured duration
  setTimeout(() => {
    errorContainer.classList.add("hidden");
  }, CONFIG.ERROR_DISPLAY_DURATION);
}

// Handle error message close button
document.querySelector(".error-close").addEventListener("click", () => {
  document.getElementById("error-container").classList.add("hidden");
});

// Store and display track results
function displayTracks(tracks) {
  AppState.currentTracks = [...tracks];
  renderTracks(tracks);
}

// Create and display track cards in the grid
function renderTracks(tracks) {
  const resultsGrid = document.querySelector(".results-grid");
  const sortContainer = document.querySelector(".sort-container");
  if (!resultsGrid) return;

  resultsGrid.innerHTML = "";
  sortContainer.classList.remove("hidden");

  // Create track cards
  tracks.forEach((track) => {
    const trackCard = document.createElement("article");
    trackCard.className = "track-card";
    trackCard.dataset.previewUrl = track.preview || "";

    const duration = track.duration || 0;
    const formattedDuration = formatTime(duration);

    // Create track card HTML
    trackCard.innerHTML = `
  <div class="track-card-inner">
    <div class="track-image">
      <img src="${track.album.cover_medium || "https://via.placeholder.com/250"}" alt="${track.title}">
      <div class="play-overlay">
        <div class="play-icon">▶</div>
      </div>
    </div>
    <div class="track-info">
      <h3 class="track-name">${track.title}</h3>
      <p class="artist-name">${track.artist.name}</p>
      <p class="album-name">${track.album.title}</p>
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
    <div class="track-actions">
      <button class="preview-button">Preview</button>
    </div>
  </div>
`;

    resultsGrid.appendChild(trackCard);
  });

  setupPreviewButtons();
}

// Set up audio preview functionality
function setupPreviewButtons() {
  document.querySelectorAll(".track-card").forEach((card) => {
    const playButton = card.querySelector(".preview-button");
    const playOverlay = card.querySelector(".play-overlay");
    const imageArea = card.querySelector(".track-image");
    const trackInfo = card.querySelector(".track-info");

    // Handle play/pause actions
    const handlePlayPause = async () => {
      const previewUrl = card.dataset.previewUrl;
      const playIcon = card.querySelector(".play-icon");
      const progressContainer = card.querySelector(".progress-container");
      const progress = card.querySelector(".progress");
      // Removed timeInfo variable since it's declared but never used

      // Stop currently playing track if exists
      if (AppState.currentlyPlayingAudio) {
        // Proper audio cleanup
        AppState.currentlyPlayingAudio.audio.pause();
        AppState.currentlyPlayingAudio.audio.currentTime = 0;
        AppState.currentlyPlayingAudio.audio.src = '';
        AppState.currentlyPlayingAudio.audio = null;
        
        AppState.currentlyPlayingAudio.card.classList.remove("playing", "loading");

        // Reset previous track's UI
        const oldPlayIcon = AppState.currentlyPlayingAudio.card.querySelector(".play-icon");
        if (oldPlayIcon) oldPlayIcon.textContent = "▶";

        // Remove old volume controls
        const oldVolumeControl = AppState.currentlyPlayingAudio.card.querySelector(".player-controls");
        if (oldVolumeControl) oldVolumeControl.remove();

        if (AppState.currentlyPlayingAudio.card === card) {
          AppState.currentlyPlayingAudio = null;
          return;
        }
      }

      try {
        // Create and play audio
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

        // Handle mute button clicks
        muteButton.addEventListener("click", (e) => {
          const newIcon = muteHandler(e);
          muteButton.textContent = newIcon;
        });

        await audio.play();

        // Update UI for playing state
        card.classList.add("playing");
        playIcon.textContent = "⏸";

        // Update progress and time displays
        audio.addEventListener("timeupdate", () => {
          const percentage = (audio.currentTime / audio.duration) * 100;
          progress.style.width = `${percentage}%`;

          const currentTime = card.querySelector(".current-time");
          const duration = card.querySelector(".duration");

          currentTime.textContent = formatTime(audio.currentTime);
          const remainingTime = audio.duration - audio.currentTime;
          duration.textContent = `-${formatTime(remainingTime)}`;
        });

        AppState.currentlyPlayingAudio = {
          audio,
          card,
          playIcon,
          progressContainer,
          progress,
        };

        // Handle track completion
        audio.onended = () => {
          card.classList.remove("playing");
          playIcon.textContent = "▶";
          progress.style.width = "0%";

          const currentTime = card.querySelector(".current-time");
          if (currentTime) currentTime.textContent = "0:00";

          const volumeControl = card.querySelector(".player-controls");
          if (volumeControl) volumeControl.remove();
          
          // Clean up audio object
          audio.src = '';

          AppState.currentlyPlayingAudio = null;
        };
      } catch (error) {
        // Handle playback errors
        console.error("Playback failed:", error);
        card.classList.remove("playing");
        playIcon.textContent = "▶";
        progress.style.width = "0%";
        AppState.currentlyPlayingAudio = null;
      }
    };

    // Add click handlers for play/pause
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

// The musicAPI object is defined in a separate file (musicAPI.js)

// Search function
async function performSearch(query) {
  // Validate search input
  if (!query || !query.trim()) {
    showError("Please enter a search term");
    return;
  }

  // Prevent multiple simultaneous searches
  if (AppState.isSearching) {
    showError("A search is already in progress. Please wait...");
    return;
  }

  const loadingSpinner = document.querySelector(".loading-spinner");
  const resultsGrid = document.querySelector(".results-grid");

  try {
    // Show loading state
    AppState.isSearching = true;
    loadingSpinner.classList.remove("hidden");
    resultsGrid.classList.add("hidden");

    // Perform search
    const tracks = await musicAPI.searchTracks(query.trim());

    // Handle no results
    if (!tracks || tracks.length === 0) {
      showError("No tracks found. Try a different search term.");
      return;
    }

    // Display search results
    displayTracks(tracks);
    
    // Show clear button
    const clearButton = document.getElementById("clear-search");
    if (clearButton) {
      clearButton.style.display = "block";
    }
  } catch (error) {
    // Handle search errors
    console.error("Search failed:", error);
    showError("Something went wrong. Please try again later.");
  } finally {
    // Reset search state and UI
    AppState.isSearching = false;
    loadingSpinner.classList.add("hidden");
    resultsGrid.classList.remove("hidden");
  }
}

// Debounced search for live search (optional future feature)
const debouncedSearch = debounce(performSearch, CONFIG.SEARCH_DEBOUNCE_DELAY);

// Handle search form submission
searchForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Reset sort selection
  sortSelect.value = "default";

  const query = searchInput.value.trim();
  await performSearch(query);
});

// Back to top button functionality
const backToTop = document.querySelector(".back-to-top");

// Show/hide back to top button based on scroll position
window.addEventListener("scroll", () => {
  const scrollPosition = window.scrollY || document.documentElement.scrollTop;

  if (scrollPosition > CONFIG.SCROLL_THRESHOLD) {
    backToTop.classList.add("visible");
  } else {
    backToTop.classList.remove("visible");
  }
});

// Smooth scroll to top when button is clicked
backToTop.addEventListener("click", () => {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
});

// Clear search button functionality
const clearSearchButton = document.getElementById("clear-search");
if (clearSearchButton) {
  clearSearchButton.addEventListener("click", () => {
    searchInput.value = "";
    searchInput.focus();
    clearSearchButton.style.display = "none";
    
    // Clear results
    const resultsGrid = document.querySelector(".results-grid");
    const sortContainer = document.querySelector(".sort-container");
    resultsGrid.innerHTML = "";
    sortContainer.classList.add("hidden");
    AppState.currentTracks = [];
    
    // Stop any playing audio
    if (AppState.currentlyPlayingAudio) {
      AppState.currentlyPlayingAudio.audio.pause();
      AppState.currentlyPlayingAudio.audio.src = '';
      AppState.currentlyPlayingAudio = null;
    }
  });
}

// Show/hide clear button based on input
searchInput.addEventListener("input", () => {
  if (clearSearchButton) {
    clearSearchButton.style.display = searchInput.value ? "block" : "none";
  }
});

// Keyboard shortcuts
document.addEventListener("keydown", (e) => {
  // Don't trigger shortcuts when typing in input fields
  if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") {
    return;
  }
  
  // Spacebar - Play/Pause currently playing track
  if (e.code === "Space" && AppState.currentlyPlayingAudio) {
    e.preventDefault();
    const audio = AppState.currentlyPlayingAudio.audio;
    const playIcon = AppState.currentlyPlayingAudio.card.querySelector(".play-icon");
    
    if (audio.paused) {
      audio.play();
      playIcon.textContent = "⏸";
    } else {
      audio.pause();
      playIcon.textContent = "▶";
    }
  }
  
  // Arrow Up - Increase volume
  if (e.code === "ArrowUp" && AppState.currentlyPlayingAudio) {
    e.preventDefault();
    const audio = AppState.currentlyPlayingAudio.audio;
    const newVolume = Math.min(audio.volume + 0.1, 1);
    audio.volume = newVolume;
    
    // Update volume slider if visible
    const volumeSlider = AppState.currentlyPlayingAudio.card.querySelector(".volume-slider");
    if (volumeSlider) {
      volumeSlider.value = newVolume;
    }
  }
  
  // Arrow Down - Decrease volume
  if (e.code === "ArrowDown" && AppState.currentlyPlayingAudio) {
    e.preventDefault();
    const audio = AppState.currentlyPlayingAudio.audio;
    const newVolume = Math.max(audio.volume - 0.1, 0);
    audio.volume = newVolume;
    
    // Update volume slider if visible
    const volumeSlider = AppState.currentlyPlayingAudio.card.querySelector(".volume-slider");
    if (volumeSlider) {
      volumeSlider.value = newVolume;
    }
  }
  
  // M - Mute/Unmute
  if (e.code === "KeyM" && AppState.currentlyPlayingAudio) {
    e.preventDefault();
    const muteButton = AppState.currentlyPlayingAudio.card.querySelector(".mute-button");
    if (muteButton) {
      muteButton.click();
    }
  }
  
  // Escape - Stop playing
  if (e.code === "Escape" && AppState.currentlyPlayingAudio) {
    e.preventDefault();
    const card = AppState.currentlyPlayingAudio.card;
    const playButton = card.querySelector(".preview-button");
    if (playButton) {
      playButton.click();
    }
  }
});
