#!/bin/bash

echo "Building Rextensions extension..."

npm run build

echo "Build complete!"
echo ""
echo "Extension files are ready in apps/extension/dist"
echo ""
echo "To load in Chrome:"
echo "   1. Open chrome://extensions/"
echo "   2. Enable Developer mode"
echo "   3. Click Load unpacked"
echo "   4. Select the apps/extension/dist folder"
echo ""
