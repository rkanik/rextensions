#!/bin/bash

echo "🚀 Building Extension Manager..."

# Build the extension
npm run build

echo "✅ Build complete!"
echo ""
echo "📁 Extension files are ready in the 'dist' directory"
echo ""
echo "📋 To load in Chrome:"
echo "   1. Open chrome://extensions/"
echo "   2. Enable 'Developer mode'"
echo "   3. Click 'Load unpacked'"
echo "   4. Select the 'dist' folder"
echo ""
echo "🎯 The dist folder contains only the necessary files for optimal performance"
