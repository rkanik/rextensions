# Extension Manager Chrome Extension

A Chrome extension built with Vue.js and Tailwind CSS that allows you to manage your installed extensions and sync them across different browsers.

## Features

- **Unified Extension Management**: Single list showing all your extensions with dynamic actions
- **Smart Detection**: Automatically detects which extensions are installed vs. available
- **Export/Import**: Export your extension list to JSON and import it on other browsers
- **Search**: Search through your extensions by name or description
- **Modern UI**: Clean, responsive interface built with Tailwind CSS

## Setup

1. Install dependencies:
```bash
npm install
```

2. Build the extension:
```bash
npm run build
```

3. Load the extension in Chrome:
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - **Select the `dist` folder** (not the project root)

## Usage

### Managing Your Extensions
- Click on the extension icon in your browser toolbar
- View your currently installed extensions and any imported extensions
- **For installed extensions**: Use "Enable/Disable" toggle and "Remove" button
- **For imported extensions**: Use "Open Store" button to install from Chrome Web Store
- Imported extensions are saved and persist between popup sessions

### Exporting/Importing Extensions
- Click "Export" to download a JSON file with your currently installed extensions
- Click "Import" and select a previously exported JSON file to add extensions to your list
- Imported extensions are saved locally and persist even after closing the popup

## Development

To run in development mode:
```bash
npm run dev
```

## Deployment

The extension is built to the `dist/` directory which contains all necessary files:
- `manifest.json` - Extension configuration
- `popup.html` - Main popup interface
- `popup.js` - Vue application bundle
- `popup.css` - Tailwind CSS styles
- `background.js` - Background service worker
- `Icon 128x128.png` - Extension icon

**Important**: When loading the extension in Chrome, select the `dist/` folder, not the project root. This ensures optimal performance and avoids loading unnecessary files.

## Permissions

This extension requires the following permissions:
- `management`: To manage installed extensions (enable/disable/uninstall)
- `tabs`: To open Chrome Web Store pages for extension installation
- `storage`: To save imported extension lists locally

## Technologies Used

- Vue.js 3 (Composition API)
- Tailwind CSS
- Vite (Build tool)
- Chrome Extension APIs

## File Structure

```
├── src/
│   ├── App.vue          # Main Vue component
│   ├── popup.js         # Vue app entry point
│   ├── background.js    # Background service worker
│   └── style.css        # Global styles with Tailwind
├── public/              # Static files (copied to dist)
│   ├── manifest.json    # Extension configuration
│   └── Icon 128x128.png # Extension icon
├── dist/                # Built extension (load this in Chrome)
│   ├── manifest.json    # Extension configuration
│   ├── popup.html       # Popup entry point
│   ├── popup.js         # Vue app bundle
│   ├── popup.css        # Tailwind styles
│   ├── background.js    # Background service worker
│   └── Icon 128x128.png # Extension icon
├── popup.html           # Source popup HTML
├── package.json         # Dependencies and scripts
├── vite.config.js       # Vite configuration
├── tailwind.config.js   # Tailwind configuration
└── postcss.config.js    # PostCSS configuration
```

## Notes

- The extension uses Chrome's management API to interact with installed extensions
- For demo purposes, some functionality is simulated when Chrome APIs are not available
- The extension is designed to work with Chrome's Manifest V3
- Files in the `public/` directory are automatically copied to `dist/` during build
