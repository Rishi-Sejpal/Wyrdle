# ⚡ Wyrdle — Speed Reader

A minimalist web app that turns any PDF into a rapid‑reading session. Upload a PDF, and each word flashes one at a time in the same spot, with the pace automatically accelerating up to **300 WPM**.

## Features

- **PDF upload** via drag‑and‑drop or click (max **10 MB**)
- **Word‑by‑word display** — one word at a time, centered
- **Auto‑acceleration** — speed gradually increases to a max of 300 WPM (over 30 s)
- **Start from page** — choose which page to begin reading on
- **Speed control** — set your starting speed (150–300 WPM)
- **Pause / Resume** while reading
- **Phosphor theme toggle** — switch between green and amber CRT phosphor (amber is default)
- **Loading screen** while the PDF is being parsed
- **Retro terminal UI** — scanlines, vignette, monitor bezel, glowing monospace type

## Project structure

```
Wyrdle/
├── index.html    # markup & favicons
├── style.css     # styling & theme
├── script.js     # app logic (PDF parsing, reading engine)
├── favicons/     # icon pack (favicon-16x32, favicon-32x32, apple-touch-icon, .ico, manifest)
└── README.md
```

## Screenshots

**Dark mode (default)** - CRT-inspired green phosphor theme with monitor bezel, scanlines, and glowing monospace typography. Features a PDF drop zone, word display area, and control panel.

**Amber mode** - Toggle the phosphor theme to amber/orange color scheme from the top bar. Switchable via the [ ZEN ] button or `Ctrl+Z` shortcut.

![WORDDASH Speed Reader dark theme](https://raw.githubusercontent.com/rishis/Wyrdle/main/screenshot-dark.png)
![WORDDASH Speed Reader amber theme](https://raw.githubusercontent.com/rishis/Wyrdle/main/screenshot-amber.png)

*Add screenshots to `screenshots/` folder and update paths above, or replace with ASCII art descriptions of the UI.*

## Getting started

The app uses pdf.js from a CDN, so it needs to be served over HTTP (not opened as `file://`):

```bash
# from the project folder
python -m http.server
# or
npx serve
# or
php -S localhost:8000
# or install dependencies:
npm install -g serve
serve
```

Then open http://localhost:8000 (or the port shown). The favicon and logo will appear in the browser tab and page header.

## How to use

1. Drop a PDF onto the dashed box (or click it to browse). Files larger than 10 MB are rejected.
2. After the loading screen, pick a **start page** and set your **starting speed** with the slider.
3. Press **Start** — words flash one at a time and speed ramps up to 300 WPM.
4. Use **Pause / Resume** anytime, and switch the **phosphor color** (green ↔ amber) from the top bar.

## Tech

- Vanilla HTML / CSS / JS (no build step)
- [pdf.js](https://mozilla.github.io/pdf.js/) (CDN) for PDF text extraction

## How it works

1. **PDF upload** — User drops a PDF or clicks [ BROWSE ], file is validated (max 10 MB, must be `.pdf`)
2. **Text extraction** — pdf.js parses each page's text content via `getTextContent()`, splitting into word arrays
3. **Page selection** — User sets start page via numeric input (1 to total pages)
4. **Reading engine** — Words flash one-at-a-time in the center, starting at the configured WPM (150-300)
5. **Auto-acceleration** — Speed ramps up over 30 seconds from start WPM to max 300 WPM
6. **Control** — Pause/Resume with `[ PAUSE ]` button or Space bar; Exit Zen mode with `Esc`
7. **Theme toggle** — Switch between green and amber CRT phosphor themes via [ ZEN ] button or `Ctrl+Z`

## But Why

This project exists to demonstrate how vanilla JavaScript can transform static PDF content into an engaging reading experience without any build step or dependencies beyond the pdf.js CDN. It showcases:

- Client-side PDF parsing respecting privacy (no server upload)
- CSS-only CRT phosphor theme switching with custom properties
- Accessible keyboard navigation (Space to start, Esc to exit, Arrow keys for navigation)
- Progressive enhancement — works in any modern browser
- Educational value for understanding the PDF text extraction API and monospaced typography control

## Tech

- Vanilla HTML / CSS / JS (no build step)
- [pdf.js](https://mozilla.github.io/pdf.js/) (CDN) for PDF text extraction