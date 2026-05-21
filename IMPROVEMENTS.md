# Music Explorer — Improvements Summary

This document tracks the major iterations on the project.

---

## v3.0 — Full Redesign & Feature Expansion

A top-to-bottom overhaul of the visual language, interaction model, and architecture, while keeping the original API integration intact.

### Visual Redesign
- New hero section with animated gradient headline, glassmorphism search field, and floating color blobs
- Premium streaming-app card grid: large covers with hover overlay, dedicated play button reveal, animated equalizer on the currently-playing card
- Sticky frosted-glass header with brand logo and live badge counter on Favorites
- Fluid typography using `clamp()`; cohesive design-token system in CSS custom properties
- Restyled empty state with a spinning vinyl record and dancing notes
- Toast notification stack replaces the previous inline error block
- Dark and light themes both refreshed; first-visit theme now follows `prefers-color-scheme`

### New Features
- **Mini-player** anchored to the bottom of the viewport — album art, scrubber (click + drag + keyboard), prev / next, play / pause, volume, mute, favorite toggle, live EQ visualization
- **Favorites** — heart any track; persisted in `localStorage` and surfaced on a dedicated Favorites tab
- **Recent searches** dropdown that appears when the search field is focused, with one-click removal per entry
- **Auto-advance** through the current queue (results or favorites) when a preview ends
- **Grid ↔ List view** toggle for results and favorites
- **Skeleton loaders** during search instead of a spinner

### Accessibility
- Skip-link, semantic landmarks, ARIA roles and labels throughout
- `aria-live` regions for results and toasts
- Visible focus rings on all interactive elements
- Keyboard-navigable cards: `Enter` / `Space` to play
- `prefers-reduced-motion` disables non-essential animations
- Pressed states on all toggle buttons (theme, favorite, view)

### Code Quality
- Single shared `Audio` element instead of constructing a new one per click (removes a small memory leak)
- IIFE-scoped module pattern with a single `State` object, cached DOM refs, escaped HTML insertion
- Debounced scroll handler for back-to-top
- Restored volume across sessions via `localStorage`
- `<meta name="theme-color">` updates with the active theme

### Mobile
- Mini-player collapses to a two-row layout with full-width scrubber
- Grid adapts to 2-column at small widths
- Hamburger menu with proper ARIA state and outside-click dismissal
- Touch + mouse drag both supported on the scrubber

### Keyboard Shortcuts
- `/` focus the search field
- `Space` play / pause
- `←` / `→` previous / next track in queue
- `↑` / `↓` volume up / down
- `M` mute / unmute
- `F` favorite the currently-playing track
- `Esc` close the mini-player (or mobile menu)

---

## v2.0 — Architecture & Security Pass *(previous release)*

### Security
- API key moved from `api.js` to a separate `js/config.js`, added to `.gitignore`
- Provided `js/config.example.js` as a template

### Architecture
- Centralized `AppState` object for shared mutable state
- Magic numbers extracted to `CONFIG` (search limit, debounce delay, scroll threshold, error duration)
- Proper audio cleanup on track switch / track end
- Debounced search utility added

### UX
- Theme preference persisted in `localStorage`
- Clear search (×) button inside the search input
- Initial keyboard shortcuts: `Space`, `↑`, `↓`, `M`, `Esc`

---

## v1.0 — Initial Release

- Vanilla HTML / CSS / JS music search experience
- Deezer API via RapidAPI for search + 30-second previews
- Light / dark themes
- Sort by title / artist / duration
- Responsive grid layout
- Contact form
