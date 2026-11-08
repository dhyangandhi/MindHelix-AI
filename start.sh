#!/usr/bin/env bash

# ======================================================================
#   🧬  M I N D H E L I X   A I   —   1 - C O M M A N D   L A U N C H E R
#   Compatible with macOS, Ubuntu, Debian, Arch, CentOS, Alpine, Raspberry Pi
# ======================================================================

set -e

echo "======================================================================"
echo "   🧬  M I N D H E L I X   A I   —   U N I V E R S A L   S H E L L"
echo "======================================================================"
echo ""

# 1. Check Node.js
if ! command -v node >/dev/null 2>&1; then
    echo "❌ [ERROR] Node.js is not installed!"
    echo "Please install Node.js v18 or higher from: https://nodejs.org/"
    exit 1
fi

# 2. Check dependencies
if [ ! -d "node_modules" ]; then
    echo "📦 [INFO] Installing required dependencies..."
    npm install --omit=dev
fi

# 3. Launch MindHelix
echo "🚀 [INFO] Launching MindHelix AI Platform..."
exec node bin/mindhelix.js "$@"
