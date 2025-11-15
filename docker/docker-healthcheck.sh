#!/bin/sh
# Health check script for Docker container
# This script checks if the Next.js application is responding

set -e

# Default values
HOST="${HOSTNAME:-0.0.0.0}"
PORT="${PORT:-3000}"
TIMEOUT=5

# Make HTTP request to the application
if command -v curl >/dev/null 2>&1; then
    # Use curl if available
    curl -f -s -o /dev/null -w "%{http_code}" --max-time $TIMEOUT "http://${HOST}:${PORT}/api/health" || exit 1
elif command -v wget >/dev/null 2>&1; then
    # Fallback to wget
    wget -q -O /dev/null -T $TIMEOUT "http://${HOST}:${PORT}/api/health" || exit 1
else
    # If neither curl nor wget is available, skip health check
    echo "Neither curl nor wget is available, skipping health check"
    exit 0
fi

exit 0
