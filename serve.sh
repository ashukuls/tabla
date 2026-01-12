#!/bin/bash
# Simple HTTP server for testing tabla apps
# Usage: ./serve.sh [port]

PORT=${1:-8888}
IP=$(hostname -I | awk '{print $1}')

echo "Starting server on port $PORT..."
echo ""
echo "Access your apps at:"
echo "  http://localhost:$PORT/"
echo "  http://$IP:$PORT/"
echo ""
echo "Files:"
echo "  http://$IP:$PORT/                    (Main page)"
echo "  http://$IP:$PORT/layakari.html       (Layakari Polyrhythm Trainer)"
echo "  http://$IP:$PORT/taal-metronome.html (Taal Metronome)"
echo ""
echo "Press Ctrl+C to stop"
echo ""

python3 -m http.server $PORT --bind 0.0.0.0
