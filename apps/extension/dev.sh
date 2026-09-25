#!/bin/bash

echo "🚀 Starting Extension Manager Development Mode"
echo "=============================================="
echo ""
echo "This will start the watch mode for automatic rebuilds."
echo "After starting, remember to:"
echo "1. Go to chrome://extensions/"
echo "2. Enable Developer mode"
echo "3. Load unpacked extension from the 'dist' folder"
echo "4. Use the refresh button to reload after changes"
echo ""
echo "Press Ctrl+C to stop the watch mode"
echo ""

# Start the watch mode
npm run dev
