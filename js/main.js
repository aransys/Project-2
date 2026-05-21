/* global document, window, setTimeout, Audio, console, musicAPI, CONFIG, localStorage, matchMedia */

/* =========================================================
   Music Explorer — App logic
   Modular state, single shared audio element, mini-player,
   favorites, recent searches, keyboard nav.
   ========================================================= */

(function () {
  "use strict";

  // ---------- State ----------
  const STORAGE_KEYS = {
    THEME: "me.theme",
    FAVORITES: "me.favorites",
    RECENT: "me.recentSearches",
    LAST_VOLUME: "me.volume",
  };

  const State = {
    tracks: [],            // current results
    favorites: [],         // saved tracks
    recent: [],            // recent search queries
    currentIndex: -1,      // index in tracks that is playing
    queueSource: "results",// "results" | "favorites"
    queue: [],             // active queue (results or favorites)
    isPlaying: false,
    isSearching: false,
    isMuted: false,
    volume: 0.6,
    activeSection: "discover",
    view: "grid",          // "grid" | "list"
  };

  // ---------- DOM ----------
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const els = {};

  // ---------- Utilities ----------
  const formatTime = (s) => {
    if (!s || isNaN(s)) return "0:00";
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60).toString().padStart(2, "0");
    return `${m}:${sec}`;
  };

  const debounce = (fn, ms) => {
    let t;
    return function (...args) {
      clearTimeout(t);
      t = setTimeout(() => fn.apply(this, args), ms);
    };
  };

  const safeJSON = (key, fallback) => {
    try {
      const v = localStorage.getItem(key);
      return v ? JSON.parse(v) : fallback;
    } catch (e) {
      console.warn("localStorage read failed", e);
      return fallback;
    }
  };
  const persist = (key, val) => {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) { /* ignore quota */ }
  };

  const escapeHTML = (str = "") =>
    String(str).replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    }[c]));

  // ---------- Toasts ----------
  const ICONS = {
    error:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>`,
    success: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>`,
    info:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>`,
    close:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>`,
  };

  function toast(message, kind = "info", duration = 3500) {
    const stack = els.toastStack;
    if (!stack) return;
    const node = document.createElement("div");
    node.className = `toast toast-${kind}`;
    node.setAttribute("role", kind === "error" ? "alert" : "status");
    node.innerHTML = `
      <div class="toast-icon">${ICONS[kind] || ICONS.info}</div>
      <div class="toast-body">${escapeHTML(message)}</div>
      <button class="toast-close" aria-label="Dismiss">${ICONS.close}</button>
    `;
    const remove = () => {
      node.classList.add("leaving");
      setTimeout(() => node.remove(), 300);
    };
    node.querySelector(".toast-close").addEventListener("click", remove);
    stack.appendChild(node);
    setTimeout(remove, duration);
  }

  // ---------- Theme ----------
  function applyTheme(theme) {
    if (theme === "light") {
      document.documentElement.setAttribute("data-theme", "light");
    } else {
      document.documentElement.removeAttribute("data-theme");
    }
    els.themeToggle?.setAttribute("aria-pressed", theme === "light" ? "true" : "false");
    document.querySelector('meta[name="theme-color"]')?.setAttribute(
      "content", theme === "light" ? "#f7f5ff" : "#0b0a1f"
    );
  }

  function initTheme() {
    const stored = localStorage.getItem(STORAGE_KEYS.THEME);
    if (stored === "light" || stored === "dark") {
      applyTheme(stored);
    } else {
      // Respect system preference on first visit
      const prefersLight = matchMedia("(prefers-color-scheme: light)").matches;
      applyTheme(prefersLight ? "light" : "dark");
    }

    els.themeToggle?.addEventListener("click", () => {
      const isLight = document.documentElement.getAttribute("data-theme") === "light";
      const next = isLight ? "dark" : "light";
      applyTheme(next);
      localStorage.setItem(STORAGE_KEYS.THEME, next);
    });
  }

  // ---------- Favorites ----------
  function loadFavorites() {
    State.favorites = safeJSON(STORAGE_KEYS.FAVORITES, []);
    updateFavCount();
  }
  function saveFavorites() {
    persist(STORAGE_KEYS.FAVORITES, State.favorites);
    updateFavCount();
  }
  function updateFavCount() {
    const n = State.favorites.length;
    if (!els.favCount) return;
    els.favCount.textContent = n;
    els.favCount.hidden = n === 0;
  }
  function isFavorite(id) {
    return State.favorites.some((t) => t.id === id);
  }
  function toggleFavorite(track) {
    if (!track) return;
    const idx = State.favorites.findIndex((t) => t.id === track.id);
    if (idx >= 0) {
      State.favorites.splice(idx, 1);
      toast("Removed from favorites", "info", 2000);
    } else {
      State.favorites.unshift(track);
      toast("Added to favorites", "success", 2000);
    }
    saveFavorites();
    syncFavoriteUI(track.id);
    if (State.activeSection === "favorites") renderFavorites();
  }
  function syncFavoriteUI(id) {
    $$(`.fav-btn[data-id="${id}"]`).forEach((b) => {
      const fav = isFavorite(Number(id));
      b.classList.toggle("active", fav);
      b.setAttribute("aria-pressed", fav ? "true" : "false");
      b.setAttribute("aria-label", fav ? "Remove from favorites" : "Add to favorites");
    });
    // Mini player heart
    if (els.mpFav && State.currentIndex >= 0) {
      const cur = State.queue[State.currentIndex];
      if (cur && Number(cur.id) === Number(id)) {
        const fav = isFavorite(cur.id);
        els.mpFav.classList.toggle("active", fav);
        els.mpFav.setAttribute("aria-pressed", fav ? "true" : "false");
      }
    }
  }

  // ---------- Recent searches ----------
  function loadRecent() {
    State.recent = safeJSON(STORAGE_KEYS.RECENT, []);
  }
  function addRecent(q) {
    q = q.trim();
    if (!q) return;
    State.recent = [q, ...State.recent.filter((x) => x.toLowerCase() !== q.toLowerCase())].slice(0, 8);
    persist(STORAGE_KEYS.RECENT, State.recent);
  }
  function removeRecent(q) {
    State.recent = State.recent.filter((x) => x !== q);
    persist(STORAGE_KEYS.RECENT, State.recent);
    renderSuggestions();
  }
  function clearRecent() {
    State.recent = [];
    persist(STORAGE_KEYS.RECENT, State.recent);
    renderSuggestions();
  }

  function renderSuggestions() {
    if (!els.suggestions) return;
    if (State.recent.length === 0) {
      els.suggestions.hidden = true;
      els.suggestions.innerHTML = "";
      return;
    }
    const inputFocused = document.activeElement === els.searchInput;
    if (!inputFocused) {
      els.suggestions.hidden = true;
      return;
    }
    els.suggestions.hidden = false;
    els.suggestions.innerHTML = `
      <div class="suggestion-header">Recent searches</div>
      ${State.recent.map((q) => `
        <li class="suggestion-item" role="option" data-query="${escapeHTML(q)}">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
          <span>${escapeHTML(q)}</span>
          <button class="remove" aria-label="Remove ${escapeHTML(q)} from history" data-remove="${escapeHTML(q)}">×</button>
        </li>
      `).join("")}
    `;
  }

  // ---------- Section nav ----------
  function showSection(id) {
    State.activeSection = id;
    const sections = {
      discover: [els.hero, els.resultsSection],
      favorites: [els.favoritesSection],
      about: [els.aboutSection],
    };
    // Hide all
    [els.hero, els.resultsSection, els.favoritesSection, els.aboutSection].forEach((s) => {
      if (s) s.hidden = true;
    });
    // Show selected
    (sections[id] || sections.discover).forEach((s) => { if (s) s.hidden = false; });

    // Update nav links
    $$(".nav-links a").forEach((a) => {
      a.classList.toggle("active", a.dataset.nav === id);
    });

    if (id === "favorites") renderFavorites();
    if (id === "discover" && els.searchInput) setTimeout(() => els.searchInput.focus({ preventScroll: true }), 50);

    // Close mobile menu
    els.hamburger?.setAttribute("aria-expanded", "false");
    els.navLinks?.classList.remove("open");

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // ---------- Card rendering ----------
  function trackCardHTML(track, index) {
    const cover = track.album?.cover_medium || track.album?.cover || "";
    const fav = isFavorite(track.id);
    return `
      <article class="track-card" data-index="${index}" data-id="${track.id}" tabindex="0" aria-label="${escapeHTML(track.title)} by ${escapeHTML(track.artist?.name || "")}. Press Enter to play.">
        <div class="track-cover">
          ${cover
            ? `<img src="${escapeHTML(cover)}" alt="" loading="lazy" />`
            : `<div style="height:100%;display:grid;place-items:center;color:var(--c-text-muted);">♪</div>`}
          <div class="track-overlay">
            <button class="play-button-lg" aria-label="Play ${escapeHTML(track.title)}">
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>
            </button>
          </div>
          <div class="card-eq" aria-hidden="true"><span></span><span></span><span></span><span></span></div>
        </div>
        <div class="track-info">
          <div class="track-title">${escapeHTML(track.title)}</div>
          <div class="track-artist">${escapeHTML(track.artist?.name || "Unknown artist")}</div>
          <div class="track-album">${escapeHTML(track.album?.title || "")}</div>
        </div>
        <div class="track-bottom">
          <span class="track-duration">${formatTime(track.duration)}</span>
          <button class="fav-btn ${fav ? "active" : ""}" data-id="${track.id}" aria-pressed="${fav ? "true" : "false"}" aria-label="${fav ? "Remove from favorites" : "Add to favorites"}">
            <svg viewBox="0 0 24 24" fill="${fav ? "currentColor" : "none"}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </button>
        </div>
      </article>
    `;
  }

  function renderTracks(tracks) {
    if (!els.resultsGrid) return;
    els.resultsGrid.setAttribute("aria-busy", "false");
    els.resultsGrid.innerHTML = tracks.map((t, i) => trackCardHTML(t, i)).join("");

    // Stagger animation
    $$(".track-card", els.resultsGrid).forEach((card, i) => {
      card.style.animationDelay = `${Math.min(i * 30, 400)}ms`;
    });

    bindCardEvents(els.resultsGrid, "results");
    // Re-mark currently playing
    if (State.queueSource === "results" && State.currentIndex >= 0) {
      const card = els.resultsGrid.querySelector(`.track-card[data-index="${State.currentIndex}"]`);
      card?.classList.add("playing");
    }
  }

  function renderFavorites() {
    if (!els.favoritesGrid) return;
    if (State.favorites.length === 0) {
      els.favoritesGrid.innerHTML = "";
      els.favoritesGrid.hidden = true;
      els.favoritesEmpty.hidden = false;
      return;
    }
    els.favoritesGrid.hidden = false;
    els.favoritesEmpty.hidden = true;
    els.favoritesGrid.innerHTML = State.favorites.map((t, i) => trackCardHTML(t, i)).join("");
    bindCardEvents(els.favoritesGrid, "favorites");
    if (State.queueSource === "favorites" && State.currentIndex >= 0) {
      els.favoritesGrid.querySelector(`.track-card[data-index="${State.currentIndex}"]`)?.classList.add("playing");
    }
  }

  function bindCardEvents(root, source) {
    $$(".track-card", root).forEach((card) => {
      const idx = Number(card.dataset.index);
      const id = Number(card.dataset.id);

      const onPlay = (e) => {
        if (e.target.closest(".fav-btn")) return;
        playFromSource(source, idx);
      };
      card.addEventListener("click", onPlay);
      card.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          playFromSource(source, idx);
        }
      });

      card.querySelector(".fav-btn")?.addEventListener("click", (e) => {
        e.stopPropagation();
        const list = source === "favorites" ? State.favorites : State.tracks;
        const track = list[idx];
        if (track) toggleFavorite(track);
        if (source !== "favorites") syncFavoriteUI(id);
      });
    });
  }

  // ---------- Player ----------
  const audio = new Audio();
  audio.preload = "metadata";

  function playFromSource(source, index) {
    State.queueSource = source;
    State.queue = source === "favorites" ? [...State.favorites] : [...State.tracks];

    const track = State.queue[index];
    if (!track) return;

    if (!track.preview) {
      toast("No preview available for this track", "info", 2500);
      return;
    }

    // Same track: toggle play/pause
    if (State.currentIndex === index && audio.src) {
      togglePlay();
      return;
    }

    setActivePlaying(index);
    audio.src = track.preview;
    audio.volume = State.isMuted ? 0 : State.volume;
    audio.play().then(() => {
      State.isPlaying = true;
      updatePlayUI(true);
    }).catch((err) => {
      console.error("Play failed:", err);
      toast("Couldn't play this preview", "error");
      setActivePlaying(-1);
    });
  }

  function setActivePlaying(index) {
    // Clear all .playing in current source
    $$(".track-card.playing").forEach((c) => c.classList.remove("playing"));
    State.currentIndex = index;
    if (index < 0) {
      hideMiniPlayer();
      return;
    }
    const track = State.queue[index];
    const root = State.queueSource === "favorites" ? els.favoritesGrid : els.resultsGrid;
    root?.querySelector(`.track-card[data-index="${index}"]`)?.classList.add("playing");
    populateMiniPlayer(track);
    showMiniPlayer();
  }

  function populateMiniPlayer(track) {
    if (!track || !els.miniPlayer) return;
    const cover = track.album?.cover_medium || track.album?.cover || "";
    els.mpCoverImg.src = cover;
    els.mpCoverImg.alt = `${track.title} cover`;
    els.mpTitle.textContent = track.title;
    els.mpArtist.textContent = track.artist?.name || "";
    const fav = isFavorite(track.id);
    els.mpFav.classList.toggle("active", fav);
    els.mpFav.setAttribute("aria-pressed", fav ? "true" : "false");
  }

  function showMiniPlayer() {
    if (els.miniPlayer.hidden) {
      els.miniPlayer.hidden = false;
      document.body.classList.remove("player-hidden");
    }
  }
  function hideMiniPlayer() {
    if (audio.src) {
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
    }
    State.isPlaying = false;
    State.currentIndex = -1;
    els.miniPlayer.classList.remove("playing");
    els.miniPlayer.hidden = true;
    document.body.classList.add("player-hidden");
    $$(".track-card.playing").forEach((c) => c.classList.remove("playing"));
  }

  function togglePlay() {
    if (!audio.src) return;
    if (audio.paused) {
      audio.play();
    } else {
      audio.pause();
    }
  }

  function nextTrack() {
    if (!State.queue.length) return;
    let i = State.currentIndex + 1;
    if (i >= State.queue.length) i = 0;
    playFromSource(State.queueSource, i);
  }
  function prevTrack() {
    if (!State.queue.length) return;
    // If more than 3s in, restart
    if (audio.currentTime > 3) {
      audio.currentTime = 0;
      return;
    }
    let i = State.currentIndex - 1;
    if (i < 0) i = State.queue.length - 1;
    playFromSource(State.queueSource, i);
  }

  function updatePlayUI(playing) {
    els.miniPlayer.classList.toggle("playing", playing);
    els.mpPlay.setAttribute("aria-label", playing ? "Pause" : "Play");
  }

  function setVolume(v) {
    v = Math.max(0, Math.min(1, v));
    State.volume = v;
    if (!State.isMuted) audio.volume = v;
    els.mpVolume.value = v;
    persist(STORAGE_KEYS.LAST_VOLUME, v);
    if (v === 0) {
      State.isMuted = true;
      els.mpVolumeWrap.classList.add("muted");
    } else if (State.isMuted) {
      State.isMuted = false;
      els.mpVolumeWrap.classList.remove("muted");
    }
  }
  function toggleMute() {
    State.isMuted = !State.isMuted;
    audio.volume = State.isMuted ? 0 : State.volume;
    els.mpVolumeWrap.classList.toggle("muted", State.isMuted);
  }

  function bindAudioEvents() {
    audio.addEventListener("play",  () => { State.isPlaying = true;  updatePlayUI(true); });
    audio.addEventListener("pause", () => { State.isPlaying = false; updatePlayUI(false); });
    audio.addEventListener("ended", () => {
      // Auto-advance
      if (State.queue.length > 1) {
        nextTrack();
      } else {
        State.isPlaying = false;
        updatePlayUI(false);
        if (els.mpProgressFill) els.mpProgressFill.style.width = "0%";
        if (els.mpProgressThumb) els.mpProgressThumb.style.left = "0%";
        els.mpCurrent.textContent = "0:00";
      }
    });
    audio.addEventListener("timeupdate", () => {
      const pct = (audio.currentTime / (audio.duration || 1)) * 100;
      if (els.mpProgressFill)  els.mpProgressFill.style.width  = `${pct}%`;
      if (els.mpProgressThumb) els.mpProgressThumb.style.left  = `${pct}%`;
      els.mpProgress.setAttribute("aria-valuenow", String(Math.round(pct)));
      els.mpCurrent.textContent  = formatTime(audio.currentTime);
      els.mpDuration.textContent = formatTime(audio.duration);
    });
    audio.addEventListener("error", () => {
      toast("Playback error — try another track", "error");
      setActivePlaying(-1);
    });
  }

  function seekFromEvent(e) {
    const rect = els.mpProgress.getBoundingClientRect();
    const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
    const ratio = Math.max(0, Math.min(1, x / rect.width));
    if (audio.duration) audio.currentTime = ratio * audio.duration;
  }

  function bindPlayerControls() {
    els.mpPlay.addEventListener("click", togglePlay);
    els.mpNext.addEventListener("click", nextTrack);
    els.mpPrev.addEventListener("click", prevTrack);
    els.mpMute.addEventListener("click", toggleMute);
    els.mpClose.addEventListener("click", hideMiniPlayer);

    els.mpVolume.addEventListener("input", (e) => setVolume(parseFloat(e.target.value)));

    // Progress: click + drag
    let dragging = false;
    els.mpProgress.addEventListener("mousedown", (e) => { dragging = true; seekFromEvent(e); });
    document.addEventListener("mousemove", (e) => { if (dragging) seekFromEvent(e); });
    document.addEventListener("mouseup",   () => { dragging = false; });

    els.mpProgress.addEventListener("touchstart", (e) => { dragging = true; seekFromEvent(e); }, { passive: true });
    document.addEventListener("touchmove",  (e) => { if (dragging) seekFromEvent(e); }, { passive: true });
    document.addEventListener("touchend",   () => { dragging = false; });

    // Keyboard on progress
    els.mpProgress.addEventListener("keydown", (e) => {
      if (!audio.duration) return;
      const step = audio.duration * 0.05;
      if (e.key === "ArrowRight") { audio.currentTime = Math.min(audio.duration, audio.currentTime + step); e.preventDefault(); }
      if (e.key === "ArrowLeft")  { audio.currentTime = Math.max(0, audio.currentTime - step); e.preventDefault(); }
    });

    // Favorite from mini player
    els.mpFav.addEventListener("click", () => {
      const track = State.queue[State.currentIndex];
      if (track) toggleFavorite(track);
    });
  }

  // ---------- Search ----------
  async function performSearch(query) {
    if (!query || !query.trim()) {
      toast("Type something to search", "info", 2200);
      els.searchInput?.focus();
      return;
    }
    if (State.isSearching) return;

    State.isSearching = true;
    els.skeletonGrid.hidden = false;
    els.resultsGrid.innerHTML = "";
    els.resultsGrid.setAttribute("aria-busy", "true");
    els.emptyState.hidden = true;
    els.resultsHeader.hidden = true;

    try {
      const tracks = await musicAPI.searchTracks(query.trim());
      if (!tracks || tracks.length === 0) {
        toast(`No tracks found for "${query}"`, "info");
        els.emptyState.hidden = false;
        return;
      }
      State.tracks = tracks;
      addRecent(query);
      els.resultsQuery.textContent = query;
      els.resultsHeader.hidden = false;
      renderTracks(tracks);
    } catch (err) {
      console.error(err);
      toast("Search failed — check your connection or API key", "error", 5000);
      els.emptyState.hidden = false;
    } finally {
      State.isSearching = false;
      els.skeletonGrid.hidden = true;
    }
  }

  function bindSearch() {
    els.searchForm.addEventListener("submit", (e) => {
      e.preventDefault();
      els.suggestions.hidden = true;
      performSearch(els.searchInput.value);
    });

    els.searchInput.addEventListener("input", () => {
      const hasVal = !!els.searchInput.value.trim();
      els.clearBtn.hidden = !hasVal;
    });

    els.searchInput.addEventListener("focus", renderSuggestions);
    els.searchInput.addEventListener("blur", () => {
      // Delay to allow click
      setTimeout(() => { if (els.suggestions) els.suggestions.hidden = true; }, 150);
    });

    els.clearBtn.addEventListener("click", () => {
      els.searchInput.value = "";
      els.clearBtn.hidden = true;
      els.searchInput.focus();
    });

    // Suggestion click
    els.suggestions.addEventListener("click", (e) => {
      const removeBtn = e.target.closest("[data-remove]");
      if (removeBtn) {
        e.stopPropagation();
        removeRecent(removeBtn.dataset.remove);
        return;
      }
      const item = e.target.closest(".suggestion-item");
      if (item) {
        els.searchInput.value = item.dataset.query;
        els.suggestions.hidden = true;
        performSearch(item.dataset.query);
      }
    });

    // Chips
    $$(".chip").forEach((chip) => {
      chip.addEventListener("click", () => {
        const q = chip.dataset.query;
        els.searchInput.value = q;
        els.clearBtn.hidden = false;
        performSearch(q);
      });
    });
  }

  // ---------- Sort & view ----------
  function bindSortAndView() {
    els.sortSelect.addEventListener("change", () => {
      const type = els.sortSelect.value;
      const list = [...State.tracks];
      const sorters = {
        title:    (a, b) => (a.title || "").localeCompare(b.title || ""),
        artist:   (a, b) => (a.artist?.name || "").localeCompare(b.artist?.name || ""),
        duration: (a, b) => (a.duration || 0) - (b.duration || 0),
      };
      const sorted = type === "default" ? State.tracks : list.sort(sorters[type] || (() => 0));
      renderTracks(sorted);
    });

    $$(".view-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const view = btn.dataset.view;
        State.view = view;
        $$(".view-btn").forEach((b) => {
          const active = b.dataset.view === view;
          b.classList.toggle("active", active);
          b.setAttribute("aria-selected", active ? "true" : "false");
        });
        els.resultsGrid.classList.toggle("list-view", view === "list");
        els.favoritesGrid?.classList.toggle("list-view", view === "list");
      });
    });
  }

  // ---------- Nav ----------
  function bindNav() {
    $$(".nav-links a").forEach((a) => {
      a.addEventListener("click", (e) => {
        e.preventDefault();
        showSection(a.dataset.nav);
      });
    });

    els.hamburger.addEventListener("click", () => {
      const open = els.navLinks.classList.toggle("open");
      els.hamburger.setAttribute("aria-expanded", open ? "true" : "false");
    });

    // Close mobile menu on outside click
    document.addEventListener("click", (e) => {
      if (!els.navLinks.classList.contains("open")) return;
      if (e.target.closest(".nav-links") || e.target.closest(".hamburger")) return;
      els.navLinks.classList.remove("open");
      els.hamburger.setAttribute("aria-expanded", "false");
    });
  }

  // ---------- Back to top ----------
  function bindBackToTop() {
    const btn = $(".back-to-top");
    if (!btn) return;
    const onScroll = debounce(() => {
      const y = window.scrollY || document.documentElement.scrollTop;
      btn.classList.toggle("visible", y > 400);
      btn.hidden = false;
    }, 80);
    window.addEventListener("scroll", onScroll, { passive: true });
    btn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  }

  // ---------- Contact form ----------
  function bindContactForm() {
    if (!els.contactForm) return;
    els.contactForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const name = $("#name-input").value.trim();
      const email = $("#email-input").value.trim();
      const message = $("#message-input").value.trim();
      if (!name || !email || !message) {
        toast("Please fill in all fields", "error");
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        toast("Please enter a valid email", "error");
        return;
      }
      const btn = els.contactForm.querySelector("button[type=submit]");
      const original = btn.textContent;
      btn.disabled = true;
      btn.textContent = "Sending…";
      await new Promise((r) => setTimeout(r, 1100));
      btn.disabled = false;
      btn.textContent = original;
      els.contactForm.reset();
      toast("Message sent — thanks for reaching out!", "success");
    });
  }

  // ---------- Keyboard shortcuts ----------
  function bindKeyboard() {
    document.addEventListener("keydown", (e) => {
      const inField = ["INPUT", "TEXTAREA", "SELECT"].includes(e.target.tagName);
      // Focus search with /
      if (e.key === "/" && !inField) {
        e.preventDefault();
        els.searchInput.focus();
        return;
      }
      if (inField) return;

      const hasTrack = State.currentIndex >= 0 && State.queue.length;

      if (e.code === "Space" && hasTrack) {
        e.preventDefault();
        togglePlay();
      }
      if (e.key === "ArrowRight" && hasTrack && !e.shiftKey) {
        e.preventDefault();
        nextTrack();
      }
      if (e.key === "ArrowLeft" && hasTrack && !e.shiftKey) {
        e.preventDefault();
        prevTrack();
      }
      if (e.key === "ArrowUp" && hasTrack) {
        e.preventDefault();
        setVolume(State.volume + 0.1);
      }
      if (e.key === "ArrowDown" && hasTrack) {
        e.preventDefault();
        setVolume(State.volume - 0.1);
      }
      if ((e.key === "m" || e.key === "M") && hasTrack) {
        e.preventDefault();
        toggleMute();
      }
      if ((e.key === "f" || e.key === "F") && hasTrack) {
        e.preventDefault();
        const t = State.queue[State.currentIndex];
        if (t) toggleFavorite(t);
      }
      if (e.key === "Escape" && !els.miniPlayer.hidden) {
        // Esc closes mobile menu or stops playback
        if (els.navLinks.classList.contains("open")) {
          els.navLinks.classList.remove("open");
          els.hamburger.setAttribute("aria-expanded", "false");
        } else {
          hideMiniPlayer();
        }
      }
    });
  }

  // ---------- Init ----------
  function cacheEls() {
    els.themeToggle    = $(".theme-toggle");
    els.hamburger      = $(".hamburger");
    els.navLinks       = $(".nav-links");
    els.favCount       = $("#fav-count");

    els.hero           = $("#discover");
    els.resultsSection = $("#results-section");
    els.favoritesSection = $("#favorites");
    els.aboutSection   = $("#about");

    els.searchForm     = $("#search-form");
    els.searchInput    = $("#search-input");
    els.clearBtn       = $("#clear-search");
    els.suggestions    = $("#search-suggestions");

    els.resultsHeader  = $(".results-header");
    els.resultsQuery   = $("#results-query");
    els.sortSelect     = $("#sort-select");
    els.skeletonGrid   = $("#skeleton-grid");
    els.resultsGrid    = $("#results-grid");
    els.emptyState     = $("#empty-state");
    els.favoritesGrid  = $("#favorites-grid");
    els.favoritesEmpty = $("#favorites-empty");

    els.contactForm    = $("#contact-form");
    els.toastStack     = $("#toast-stack");

    // Mini player
    els.miniPlayer     = $("#mini-player");
    els.mpCoverImg     = $("#mp-cover-img");
    els.mpTitle        = $("#mp-title");
    els.mpArtist       = $("#mp-artist");
    els.mpFav          = $("#mp-fav");
    els.mpPlay         = $("#mp-play");
    els.mpPrev         = $("#mp-prev");
    els.mpNext         = $("#mp-next");
    els.mpProgress     = $("#mp-progress");
    els.mpProgressFill = $("#mp-progress-fill");
    els.mpProgressThumb= $("#mp-progress-thumb");
    els.mpCurrent      = $("#mp-current");
    els.mpDuration     = $("#mp-duration");
    els.mpMute         = $("#mp-mute");
    els.mpVolume       = $("#mp-volume");
    els.mpVolumeWrap   = $(".mp-volume");
    els.mpClose        = $("#mp-close");
  }

  function init() {
    cacheEls();
    initTheme();
    loadFavorites();
    loadRecent();

    // Restore last volume
    const savedVol = safeJSON(STORAGE_KEYS.LAST_VOLUME, 0.6);
    setVolume(savedVol);

    bindAudioEvents();
    bindPlayerControls();
    bindSearch();
    bindSortAndView();
    bindNav();
    bindBackToTop();
    bindContactForm();
    bindKeyboard();

    // Mini-player starts hidden + body adjusted
    document.body.classList.add("player-hidden");

    // Initial section
    showSection("discover");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
