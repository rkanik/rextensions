# Development Setup Guide

## Rebuild on Change Implementation

This guide explains how to set up automatic rebuilds when you make changes to your Chrome extension code.

### Available Scripts

1. **`npm run watch`** - Builds the extension and watches for changes
2. **`npm run dev:watch`** - Development mode with watch enabled
3. **`npm run dev`** - Standard development server (for web development)

### How to Use

1. **Start the watch mode:**
   ```bash
   npm run watch
   ```

2. **Make changes to your code** in the `src/` directory or `popup.html`

3. **The extension will automatically rebuild** when you save changes

4. **Reload the extension in Chrome:**
   - Go to `chrome://extensions/`
   - Find your extension
   - Click the refresh/reload button

### Chrome Extension Development Workflow

1. Run `npm run watch` in your terminal
2. Load the extension in Chrome from the `dist/` folder
3. Make changes to your Vue components or JavaScript files
4. The build will automatically trigger
5. Reload the extension in Chrome to see changes

### Tips for Efficient Development

- Keep the Chrome Extensions page open (`chrome://extensions/`)
- Enable "Developer mode" in Chrome Extensions
- Use the refresh button on your extension card for quick reloads
- The watch mode will rebuild the entire extension when any file changes

### File Structure

- `src/` - Your Vue components and JavaScript files
- `popup.html` - The popup entry point
- `public/` - Static assets (manifest.json, icons)
- `dist/` - Built extension (auto-generated)

### Troubleshooting

If the watch mode isn't working:
1. Check that you're running the correct script
2. Ensure no other processes are using the same ports
3. Try stopping and restarting the watch process
4. Check the terminal for any error messages
