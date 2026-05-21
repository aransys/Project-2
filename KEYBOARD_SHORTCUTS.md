# Music Explorer — Keyboard Shortcuts

Quick reference for keyboard shortcuts in Music Explorer.

## Available Shortcuts

### Search & Navigation

| Key | Action |
|-----|--------|
| `/` | Focus the search field |
| `Esc` | Close the mini-player (or close the mobile menu if open) |

### Playback Control

| Key | Action |
|-----|--------|
| `Space` | Play / pause the current track |
| `←` (Left Arrow)  | Previous track in queue (or restart current if > 3s in) |
| `→` (Right Arrow) | Next track in queue |

### Volume Control

| Key | Action |
|-----|--------|
| `↑` (Up Arrow)    | Volume up by 10% |
| `↓` (Down Arrow)  | Volume down by 10% |
| `M` | Mute / unmute |

### Favorites

| Key | Action |
|-----|--------|
| `F` | Favorite / unfavorite the currently-playing track |

### Card Interaction

| Key | Action |
|-----|--------|
| `Tab` | Move focus between track cards |
| `Enter` or `Space` (on a focused card) | Play that track |

### Mini-Player Scrubber (focused)

| Key | Action |
|-----|--------|
| `←` / `→` | Seek backward / forward by 5% |

## Notes

- Shortcuts are ignored while typing in an input, select, or textarea.
- Playback shortcuts only fire while a track is loaded in the mini-player.
- Volume and mute state persist across sessions via `localStorage`.

## Accessibility

Shortcuts complement full keyboard navigation throughout the app:
- Skip-link at the top jumps to the main content.
- Every interactive element shows a visible focus ring.
- Track cards are focusable and operable with `Tab` + `Enter`.
- Toggle buttons (theme, favorite, view) expose `aria-pressed`.
- `aria-live` regions announce results and toasts to screen readers.
