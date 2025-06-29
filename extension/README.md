# 🎯 Fokus - Chrome Extension

A productivity-focused Chrome extension that helps you stay focused by blocking distracting websites with customizable timers.

## Features

- **Focus Mode**: Block access to distracting websites
- **Timer-based Focus**: Set custom focus durations (15, 30, 45, or 60 minutes)
- **Visual Blocking**: Beautiful overlay prevents access to blocked sites
- **Give Up Option**: Easy exit from timer-based focus sessions
- **Per-site Control**: Independent focus mode for each website
- **Notifications**: Get notified when focus sessions complete

## How It Works

1. **Click the extension icon** on any website you want to focus away from
2. **Choose your focus mode**:
   - Start Focus Mode (indefinite)
   - Set a timer (15-60 minutes)
3. **When you revisit the site**, you'll see a focus mode overlay
4. **For timed sessions**, watch the countdown and use "Give Up" if needed
5. **Turn off focus mode** anytime from the overlay or extension popup

## Installation

### Development Setup

1. Clone this repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Build the extension:
   ```bash
   npm run build
   ```

### Load in Chrome

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the `dist` folder from this project
5. The Fokus extension should now appear in your extensions bar

## Development

- **Development mode**: `npm run dev`
- **Build extension**: `npm run build`
- **Lint code**: `npm run lint`

## File Structure

- `src/App.tsx` - Main popup interface
- `src/content.ts` - Content script for blocking websites
- `src/background.ts` - Background service worker for timers
- `public/manifest.json` - Chrome extension manifest
- `dist/` - Built extension files (load this folder in Chrome)

## Tech Stack

- React + TypeScript + Vite
- Tailwind CSS for styling
- Chrome Extension APIs (storage, alarms, tabs)
- Chrome Extension Manifest V3

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test the extension thoroughly
5. Submit a pull request

---

Stay focused! 🎯
