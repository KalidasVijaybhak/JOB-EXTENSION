# Job Autocomplete Pro — Interview Prep

---

## What Is a Chrome Extension?

A Chrome extension is a small web app (HTML, CSS, JS) that runs inside the browser and can interact with web pages, browser tabs, storage, and Chrome APIs. Built on **Manifest V3** (the current standard since 2023).

---

## File Structure

```
JOBEXTENSION/
├── manifest.json          # Brain of the extension — declares everything
├── popup/
│   ├── popup.html         # The UI shown when you click the extension icon
│   ├── popup.css          # Styles for the popup
│   └── popup.js           # Logic: save/load profile, form management
├── content/
│   └── content.js         # Injected into every web page — detects & fills forms
└── icons/
    ├── icon16.png
    ├── icon48.png
    └── icon128.png
```

### Key Files Explained

| File | Role |
|---|---|
| `manifest.json` | Declares permissions, scripts, icons, version |
| `popup.js` | Manages the profile form, reads/writes `chrome.storage` |
| `content.js` | Runs on job sites — detects form fields, shows dropdown, fills values |

---

## manifest.json — The Most Important File

```json
{
  "manifest_version": 3,
  "name": "Job Autocomplete Pro",
  "permissions": ["storage", "tabs"],
  "action": { "default_popup": "popup/popup.html" },
  "content_scripts": [{
    "matches": ["<all_urls>"],
    "js": ["content/content.js"],
    "run_at": "document_idle"
  }]
}
```

- `permissions` — declare only what you need (Google's review rejects over-permission)
- `content_scripts` — injected into pages matching the pattern
- `action` — what opens when icon is clicked

---

## Chrome Extension Concepts

| Concept | What it means |
|---|---|
| **Popup** | The small window that appears on icon click. Destroyed when closed |
| **Content Script** | JS injected into web pages. Cannot access extension APIs directly |
| **Background Service Worker** | Persistent background logic (we don't use one here) |
| **chrome.storage.sync** | Saves data synced across devices, works offline (cached) |
| **chrome.storage.local** | Local-only storage, higher quota |
| **Shadow DOM** | Isolates our dropdown UI from the host page's CSS |

---

## Dos and Don'ts

### ✅ Do
- Use **Shadow DOM** for injected UI — prevents CSS conflicts with host pages
- Use `chrome.storage` instead of `localStorage` — survives popup close
- Bundle all assets locally — never depend on CDN for offline support
- Declare **minimum permissions** — excess permissions get flagged in review
- Use `run_at: document_idle` so content script runs after page loads
- Trigger native input events (`input`, `change`) after filling — React/Vue need this

### ❌ Don't
- Don't use `eval()` or remote scripts — blocked by Manifest V3 CSP
- Don't load Google Fonts or any CDN at runtime — breaks offline use
- Don't store sensitive data in `localStorage` — not accessible across extension contexts
- Don't use `manifest_version: 2` — deprecated, rejected by Chrome Web Store now
- Don't inject scripts via `innerHTML` — security risk, blocked by CSP
- Don't over-request permissions like `<all_urls>` without justification

---

## Challenges Faced While Building

### 1. Form Field Detection
Job sites use wildly different HTML — no standard. A "First Name" field might have `id="fname"`, `aria-label="Given Name"`, or a Workday-specific `data-automation-id`. 
**Solution:** Multi-signal heuristic scoring — checks id, name, placeholder, aria-label, label text, parent DOM text, Workday-specific attributes.

### 2. React / Vue / Angular Inputs
Setting `input.value = "x"` does nothing in React — the framework owns the value.  
**Solution:** Use native property setter (`Object.getOwnPropertyDescriptor`) and fire `input`, `change`, `keydown`, `keyup` events to trick the framework.

### 3. CSS Isolation
Our dropdown got destroyed by host-page CSS (z-index wars, font overrides, resets).  
**Solution:** Shadow DOM — our styles are completely isolated.

### 4. Popup State Loss
Popup JS re-runs from scratch every time it opens — no in-memory state.  
**Solution:** All data lives in `chrome.storage.sync`. Popup loads fresh on every open.

### 5. Offline Support
Google Fonts `@import` was causing silent failures with no internet.  
**Solution:** Removed all external CDN references. Extension now has zero network dependencies — works 100% offline.

### 6. Dock Mode (Floating Panel)
Needed the full popup to live inside a job application page without being a popup.  
**Solution:** Injected a draggable iframe via content script, pointing to `chrome.runtime.getURL('popup/popup.html')`.

### 7. Chrome Web Store Review
- Required a Privacy Policy because the extension stores personal data (name, email, phone)
- Manifest V3 enforces strict CSP — no inline scripts, no remote code

---

## The Journey of This Extension

### Problem
Filling out job applications is repetitive — same fields (name, email, phone, experience, education) typed over and over across dozens of sites.

### Idea
Build a browser extension that stores your profile once and auto-suggests values whenever a form field is focused.

### What Was Built

1. **Profile Form (Popup)**  
   A structured form to enter personal info, work experience, education, certifications, languages, websites, and custom fields. Data saved to `chrome.storage.sync`.

2. **Smart Field Detection (Content Script)**  
   When any input is focused on any website, the content script reads the field's context (label, placeholder, aria-attributes, DOM tree) and scores it against profile fields using regex-based fuzzy matching.

3. **Autofill Dropdown**  
   Shows top matching suggestions in a Shadow DOM dropdown. Click to fill. Keyboard navigable (↑↓ Enter Escape).

4. **Per-Site Disable Toggle**  
   Some sites are sensitive. Added a toggle to disable autofill for specific hostnames.

5. **Dock Mode**  
   A draggable floating panel that embeds the full popup as an iframe — so you can edit your profile without leaving the job application page.

6. **Import / Export**  
   Profile can be exported as JSON and imported on another device.

7. **Offline First**  
   Removed all CDN dependencies (Google Fonts). Extension works with zero internet connection.

### Tech Stack
- Vanilla JS (no frameworks — keeps extension lightweight)
- Shadow DOM for UI isolation
- `chrome.storage.sync` for cross-device profile sync
- Manifest V3

---

## One-Line Summary for Interview

> "It's a Manifest V3 Chrome extension that injects a content script into every page, detects form fields using multi-signal heuristics, and suggests stored profile values in a Shadow DOM dropdown — solving the pain of repetitive job application forms."
