# Extension Manager Chrome Extension

A Chrome extension built with Vue.js and Tailwind CSS that allows you to manage your installed extensions and sync them across different browsers.

## Features

- **Unified Extension Management**: Single list showing all your extensions with dynamic actions
- **Smart Detection**: Automatically detects which extensions are installed vs. available
- **Export/Import**: Export your extension list to JSON and import it on other browsers
- **Cloud Backup / Restore**: Sign in with Google to sync your extension list across Chromium browsers (Open Store for missing ones — restore does not auto-install)
- **Search**: Search through your extensions by name or description
- **Modern UI**: Clean, responsive interface built with Tailwind CSS

## Setup

1. Install dependencies:
```bash
npm install
```

2. Copy `.env.example` to `.env` and set `VITE_CHROME_OAUTH_CLIENT_ID` (see **Local Google sign-in** below).

3. Build the extension:
```bash
npm run build
```

4. Load the extension in Chrome:
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - **Select the `dist` folder** (not the project root)

### Local Google sign-in

1. Build and load unpacked from `dist/`, then copy the **Extension ID** from `chrome://extensions`.
2. Google Cloud Console (same project as Firebase) → Credentials → Create OAuth client → type **Chrome extension** → paste that Extension ID.
3. Set `VITE_CHROME_OAUTH_CLIENT_ID` in `.env`, rebuild, reload the extension.
4. Firebase Console → Authentication → enable **Google** provider.
5. Firebase → Authentication → Settings → Authorized domains: add `chrome-extension://YOUR_EXTENSION_ID` if prompted.
6. Deploy [`firestore.rules`](firestore.rules) so only `backups/{uid}` is readable/writable by that user.
7. Open the popup → Sign in with Google → test Backup / Restore.

Moving the project folder can change the unpacked Extension ID; update the OAuth client if that happens.

## Usage

### Managing Your Extensions
- Click on the extension icon in your browser toolbar
- View your currently installed extensions and any imported / restored sync lists
- **For installed extensions**: Use "Enable/Disable" toggle and "Remove" button
- **For sync-list extensions**: Use "Open Store" to install from Chrome Web Store
- Imported / restored lists persist in `chrome.storage.local`

### Cloud Backup / Restore
- Sign in with Google (menu → Sign in with Google)
- **Backup** saves your installed extension list to Firestore
- **Restore** loads that list as a local sync list (not auto-install). Open Store for each missing extension
- Account recovery is via your Google Account (no email/password in the extension)

### Exporting/Importing Extensions
- Click "Export" to download a JSON file with your currently installed extensions
- Click "Import" and select a previously exported JSON file to add a sync list
- Useful for non-Chromium browsers or offline transfer

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
- `tabs`: To open Chrome Web Store pages and related chrome:// pages
- `storage`: To save imported / restored sync lists locally
- `identity`: Google sign-in via Chrome Identity API
- Host access to Google / Firebase APIs for Auth and Firestore

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
