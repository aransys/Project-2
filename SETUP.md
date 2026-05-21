# Music Explorer — Setup Guide

## Quick Start

### 1. API Key Configuration

Music Explorer uses the Deezer API via RapidAPI.

**Option A — use the included development key**
The repo ships with a pre-configured key in `js/config.js` for local testing.

**Option B — bring your own key (recommended)**

1. Get a free API key from [RapidAPI Deezer API](https://rapidapi.com/deezerdevs/api/deezer-1).
2. Copy the template:
   ```bash
   cp js/config.example.js js/config.js
   ```
3. Open `js/config.js` and replace `YOUR_RAPIDAPI_KEY_HERE`.
4. The file is already in `.gitignore`.

### 2. Run the app

Open `index.html` directly in a browser, or serve the folder:

```bash
# Python
python -m http.server 8000

# Node
npx http-server
```

Then visit `http://localhost:8000`.

## Configuration

All knobs live in `js/config.js`:

```js
const CONFIG = {
  RAPIDAPI_KEY:           "your-api-key-here",
  RAPIDAPI_HOST:          "deezerdevs-deezer.p.rapidapi.com",
  SEARCH_LIMIT:            10,    // tracks returned per search
  ERROR_DISPLAY_DURATION:  5000,  // ms (legacy)
  SEARCH_DEBOUNCE_DELAY:   300,   // ms
  SCROLL_THRESHOLD:        100,   // px before back-to-top appears
};
```

## Features

### Search & Discovery
- Glassmorphism search field with quick-search chips
- Recent searches dropdown (focus the field to see them)
- Skeleton loaders during fetch; toasts for errors and empty results
- Sort by relevance, title, artist, or duration
- Grid / list view toggle

### Mini-Player
- Sticky bottom bar with album art, scrubber, prev / next, volume, mute, favorite
- Live equalizer animation while playing
- Auto-advances through the current queue (results or favorites)
- Click + drag + keyboard scrubbing

### Favorites
- Heart any track to save it; persists in `localStorage`
- Dedicated Favorites view with a badge counter in the nav

### Themes
- Dark / light themes with smooth transitions
- First-visit theme follows `prefers-color-scheme`
- Selection persists across sessions

### Accessibility
- Semantic landmarks, ARIA labels, `aria-live` regions
- Visible focus rings; keyboard-operable cards
- Skip-link, `prefers-reduced-motion` respected
- Pressed states on all toggle buttons

## Keyboard Shortcuts

See [KEYBOARD_SHORTCUTS.md](KEYBOARD_SHORTCUTS.md) for the full table.

| Key | Action |
|-----|--------|
| `/` | Focus search |
| `Space` | Play / pause |
| `←` / `→` | Prev / next track |
| `↑` / `↓` | Volume up / down |
| `M` | Mute |
| `F` | Favorite current track |
| `Esc` | Close mini-player |

## Security Notes

⚠️ Because the app is fully client-side, the API key is always visible in the browser's network panel. For production, place a small backend proxy in front of RapidAPI and add domain restrictions in the RapidAPI dashboard.

Good practices already in the repo:
- Key in a separate `config.js`, excluded from git
- `config.example.js` template for new contributors
- All user input is HTML-escaped before insertion

## File Structure

```
Project-2/
├── index.html              # App shell + landmarks
├── css/
│   └── style.css           # Design tokens, components, responsive layout
├── js/
│   ├── config.js           # API key & UI settings (gitignored)
│   ├── config.example.js   # Template
│   ├── api.js              # MusicAPI wrapper around Deezer/RapidAPI
│   └── main.js             # App logic: state, render, player, favorites, a11y
├── assets/
│   └── images/             # Wireframes, screenshots, testing artifacts
├── IMPROVEMENTS.md         # Changelog
├── KEYBOARD_SHORTCUTS.md   # Shortcut reference
├── README.md               # Project documentation
└── SETUP.md                # This file
```

## Architecture

**State** — a single `State` object inside `main.js` (IIFE-scoped) holds:
```js
{
  tracks,        // current search results
  favorites,     // persisted in localStorage
  recent,        // recent search queries (persisted)
  queue,         // active queue: results or favorites
  queueSource,   // "results" | "favorites"
  currentIndex,  // index in queue that's playing
  volume,        // persisted in localStorage
  isPlaying, isSearching, isMuted, view, activeSection
}
```

**Audio** — a single shared `Audio` element is reused across tracks. No `new Audio()` per click → no leaks.

**API** — `MusicAPI` class in `api.js` exposes `searchTracks(query, limit)` and returns Deezer track objects unchanged.

**Persistence** — `localStorage` keys: `me.theme`, `me.favorites`, `me.recentSearches`, `me.volume`.

## Troubleshooting

| Problem | Fix |
|---------|-----|
| "API key not configured" | Confirm `js/config.js` exists and `RAPIDAPI_KEY` is set |
| No preview audio | Some tracks have no preview URL — try another |
| Theme reverts | Check `localStorage` isn't blocked / cleared |
| Favorites missing | Same — `localStorage` was cleared |

## Resources

- [Deezer API docs](https://developers.deezer.com/api)
- [RapidAPI Deezer endpoint](https://rapidapi.com/deezerdevs/api/deezer-1)
- [MDN — HTMLMediaElement](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement)
