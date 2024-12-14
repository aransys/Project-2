# Music Explorer

## Overview

An interactive music discovery platform using the Deezer API. Built with vanilla JavaScript, HTML, and CSS, featuring real-time music previews and interactive UI.

## Current Features

- ✅ Interactive search functionality
- ✅ Real-time Deezer API integration
- ✅ Loading states with spinner animation
- ✅ Error handling with user feedback
- ✅ Responsive card layout
- ✅ Audio preview with progress bar and timestamps
- ✅ Visual feedback animations
- ✅ Welcome screen with animation
- 📝 Volume control (planned)
- 📝 Advanced search filters (planned)
- 📝 Keyboard shortcuts (planned)
- 📝 Dark/Light theme toggle (planned)
- 📝 Favorites system (planned)
- 📝 Sort by duration/title/artist (planned)
- 📝 Share functionality (planned)

## Technologies

- HTML5
- CSS3 (Grid, Flexbox, Custom Properties)
- JavaScript (ES6+)
- Deezer API via RapidAPI
- Git & GitHub

## Quick Start

1. Clone the repository
2. Set up RapidAPI key in config.js
3. Open `index.html` in your browser
4. Search for your favorite music!

## Development Log

### Day 1 (December 11, 2024)

Initial Setup & API Integration:

- Created GitHub repository
- Set up basic file structure (HTML, CSS, JS)
- Implemented initial Spotify API authentication
- Created search functionality basics
- Set up error handling structure
- Added basic documentation
  Technical challenges:
- Resolved API authentication issues
- Implemented proper error handling
- Set up secure credential storage

### Day 2 (December 12, 2024)

UI Development & Enhancement:

- Created responsive card layout
- Implemented search form with animations
- Added loading spinner functionality
- Enhanced error handling system
- Improved CSS organization
- Added normalize.css for consistency
  Technical improvements:
- Implemented CSS Grid for card layout
- Created reusable CSS variables
- Added responsive design breakpoints

### Day 3 (December 14, 2024)

API Switch & Core Functionality:

- Switched from Spotify to Deezer API due to preview limitations
- Implemented working music preview functionality
- Added loading animations and states
- Created welcome screen with animations
- Enhanced error messaging system
  Technical challenges overcome:
- Resolved CORS issues with API
- Implemented proper audio handling
- Created smooth loading states

### Day 4 (December 14, 2024 - continued)

Enhanced Player Features:

- Added progress bar for audio previews
- Implemented time tracking and display
- Created pulsing animation for playing cards
- Added smooth transitions between states
- Enhanced visual feedback
  Technical implementations:
- Created custom progress bar
- Implemented time formatting
- Added animation keyframes
- Enhanced state management

## Challenges & Solutions

### API Integration Journey

1. Initial Spotify API Implementation

   - **Challenge**: Implementing Spotify API with preview functionality
   - **Initial Code**:
     ```javascript
     async searchTracks(query, limit = 10) {
         const response = await fetch(
             `https://api.spotify.com/v1/search?q=${query}&type=track&limit=${limit}`,
             {
                 headers: {
                     'Authorization': `Bearer ${this.accessToken}`
                 }
             }
         );
     }
     ```
   - **Issues Faced**:
     - Preview URLs were consistently null
     - Complex authentication flow
     - Limited access with client credentials
   - **Solution**: Switched to Deezer API with simpler implementation:
     ```javascript
     async searchTracks(query, limit = 10) {
         const response = await fetch(
             `https://deezerdevs-deezer.p.rapidapi.com/search?q=${encodeURIComponent(query)}`,
             {
                 headers: {
                     'X-RapidAPI-Key': config.RAPID_API_KEY,
                     'X-RapidAPI-Host': 'deezerdevs-deezer.p.rapidapi.com'
                 }
             }
         );
     }
     ```
   - **Learning**: Sometimes simplifying the technology stack is better than implementing complex workarounds

2. Error Handling Evolution

   - **Challenge**: Creating user-friendly error messages for various failure points
   - **Initial Basic Error Handling**:
     ```javascript
     try {
       const tracks = await spotifyAPI.searchTracks(query);
     } catch (error) {
       console.error(error);
     }
     ```
   - **Improved Solution**:

     ```javascript
     function showError(message) {
       const errorContainer = document.getElementById("error-container");
       const errorText = document.getElementById("error-text");

       errorText.textContent = message;
       errorContainer.classList.remove("hidden");

       setTimeout(() => {
         errorContainer.classList.add("hidden");
       }, 5000);
     }

     try {
       const tracks = await musicAPI.searchTracks(query);

       if (!tracks || tracks.length === 0) {
         showError("No tracks found. Try a different search term.");
         return;
       }

       displayTracks(tracks);
     } catch (error) {
       console.error("Search failed:", error);
       showError("Something went wrong. Please try again later.");
     }
     ```

   - **Learning**: Proper error handling significantly improves user experience

   ### Audio Player Implementation

3. Loading State Management

   - **Challenge**: Flash of loading state for fast-loading tracks
   - **Initial Problem**:
     ```javascript
     // Loading state would show even for instant loads
     card.classList.add("loading");
     const audio = new Audio(previewUrl);
     await audio.play();
     card.classList.remove("loading");
     ```
   - **Improved Solution**:

     ```javascript
     let loadingTimeout = null;

     // Only show loading after 200ms delay
     loadingTimeout = setTimeout(() => {
       card.classList.add("loading");
       button.textContent = "Loading...";
     }, 200);

     try {
       await audio.play();
       clearTimeout(loadingTimeout);
     } catch (error) {
       clearTimeout(loadingTimeout);
     }
     ```

   - **Learning**: Small timing adjustments can greatly improve perceived performance

4. Audio State Management

   - **Challenge**: Managing multiple audio instances and state
   - **Initial Issues**:
     - Multiple tracks playing simultaneously
     - Memory leaks from unused audio instances
     - Inconsistent play/pause states
   - **Solution**:

     ```javascript
     let currentlyPlaying = null;

     function setupPreviewButtons() {
       document.querySelectorAll(".track-card").forEach((card) => {
         card.addEventListener("click", async () => {
           // Stop current audio if playing
           if (currentlyPlaying) {
             currentlyPlaying.audio.pause();
             currentlyPlaying.card.classList.remove("playing");
             // If clicking same card, just stop
             if (currentlyPlaying.card === card) {
               currentlyPlaying = null;
               return;
             }
           }

           // Play new audio
           const audio = new Audio(previewUrl);
           await audio.play();
           currentlyPlaying = {
             audio,
             card,
             button,
             playIcon,
           };
         });
       });
     }
     ```

   - **Learning**: Centralized state management prevents audio conflicts

5. Progress Tracking

   - **Challenge**: Implementing accurate progress bar with time display
   - **Solution**:

     ```javascript
     // Time formatting helper
     function formatTime(seconds) {
       const mins = Math.floor(seconds / 60);
       const secs = Math.floor(seconds % 60);
       return `${mins}:${secs.toString().padStart(2, "0")}`;
     }

     // Progress and time updates
     audio.addEventListener("timeupdate", () => {
       const percentage = (audio.currentTime / audio.duration) * 100;
       progress.style.width = `${percentage}%`;

       currentTime.textContent = formatTime(audio.currentTime);
       duration.textContent = formatTime(audio.duration);
     });

     // Wait for metadata before playing
     await new Promise((resolve) => {
       audio.addEventListener("loadedmetadata", () => {
         duration.textContent = formatTime(audio.duration);
         resolve();
       });
     });
     ```

   - **Learning**: Handling audio metadata loading is crucial for accurate timing

## Credits

- Deezer API via RapidAPI for music data
- Normalize.css for styling consistency
- Design inspired by modern music platforms
- Card layout patterns from MDN Web Docs
- Loading animation patterns from CSS-Tricks

## License

MIT License
