# 💱 Currency Converter App

A modern, responsive currency converter web app built with plain **HTML**, **CSS**, and **JavaScript**. The app fetches exchange rates from a public API and includes progressive enhancements so it remains usable offline and on slow networks.

This README was updated to reflect recent enhancements: loading states, improved validation, caching and offline fallbacks, conversion history, a theme toggle, PWA support, and a non-cluttering details panel that shows raw rates and timestamps.

## 🚀 Key Features (complete)

- Live exchange rates fetched from ExchangeRate API (or any compatible provider).
- Local caching of currency lists and exchange rates with a 30-minute TTL to reduce network usage.
- Offline fallback: when offline the app will use cached rates or conversion history when available.
- Loading spinner and improved loading states for all async operations.
- Input sanitization and robust validation (prevents non-numeric input, negative or zero amounts, overly large numbers).
- Conversion history (recent conversions saved in localStorage) — used as a fallback when rates for a pair are not cached.
- Theme toggle (light / dark) persisted in localStorage.
- PWA support: a Service Worker caches static assets and API responses; a manifest.json enables installability.
- Details panel (collapsible) that shows:
  - Raw rate (6 decimal precision)
  - Source of the rate (api / cache / history)
  - Fetched timestamp (when available)
  - Original amount (moved into details to keep the main UI clean)
- Accessibility improvements: ARIA attributes, keyboard focus, contrast/hovers for the Details button in both themes.
- UX polish: first-time users see the Details panel auto-open once (persisted); the Details button has a brief hint animation to improve discovery.

## 🧭 How the UI behaves

- The main result area shows only the converted amount (clean, uncluttered).
- Click the `Details` button to reveal the original amount, the raw rate (6 decimals), source label, and fetch timestamp.
- On the very first conversion the Details panel auto-expands briefly to show users where to find extra info; this is remembered so it won't auto-open again.

## � Developer notes & caching

- Service Worker (service-worker.js) caches static assets and API responses. To force clients to pick up the latest CSS/JS I added cache-busting query parameters to `index.html` (e.g., `script.js?v=3`).
- If you see an older UI, do a hard reload or unregister the service worker in DevTools (Application → Service Workers → Unregister) and reload the page.
- The service worker cache names were bumped (v2) when updating assets to trigger install on clients.

## 🔁 Local storage keys (used)

- `currencies` — cached list of currency codes
- `rates_<BASE>` — cached rates object for a given base currency (with timestamp wrapper)
- `conversionHistory` — array of last conversions (used for fallback)
- `theme` — saved theme preference
- `detailsSeen` — flag set when the Details panel auto-opens the first time

## ✅ How to run & test locally

1. Open the project in VS Code.
2. Start Live Server (right-click `index.html` → Open with Live Server) or serve the folder with any static server.
	- PWA install prompts require HTTPS or an installed app; for local dev use DevTools to inspect Service Worker and manifest.
3. Perform conversions while online to populate the cache.
4. Test offline behavior:
	- In DevTools → Network → set `Offline`, then try converting a previously-used pair — the app should use cached rates or history.
5. If UI changes aren't visible immediately, either:
	- Hard reload (Ctrl+F5) or DevTools → right-click reload → "Empty Cache and Hard Reload"; or
	- DevTools → Application → Service Workers → Unregister the service worker → reload.

## 🔧 Troubleshooting

- If the Details button text looks unreadable in light/dark mode, the app now uses theme-specific styles for the button and improved hover/focus states.
- If API calls fail, the UI will show a friendly error message and attempt to fall back to cached data or conversion history.

## 🗂 Files of interest

- `index.html` — main page; now includes versioned `style.css?v=3` and `script.js?v=3` for cache-busting.
- `style.css` — UI styling, theming, spinner, details panel, and accessibility rules.
- `script.js` — core logic: fetching currencies, conversion, caching, history, details UI wiring, theme handling, and service worker registration.
- `service-worker.js` — PWA service worker that caches static assets and API responses (cache names bumped to v2).
- `manifest.json` — PWA metadata for installability.

## 🎯 Recent commits (high level)

- feat: details toggle with raw rate & timestamp; add details styles and input handling improvements
- ux: make Details discoverable — styled toggle, hint animation, auto-open on first conversion (persisted)
- fix(pwa): bump service worker cache names to force update (v2)
- chore: cache-bust CSS/JS includes to force clients to load updated UI
- ui: show only converted amount; move original amount into details panel
- style: improve Details button contrast and hover/focus for light & dark themes

## 🔮 Next improvements (optional)

- Add a user setting to choose decimal precision for the main display (2 / 4 / 6).
- Provide an option to pin details open by default.
- Add unit/integration tests for critical logic (formatting, caching TTL, history fallback).

---

If you'd like, I can also update this README with example screenshots, a short GIF of the Details auto-open behavior, or step-by-step screenshots for the offline test.
