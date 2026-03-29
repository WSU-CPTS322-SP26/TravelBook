#!/bin/bash

# ─────────────────────────────────────────────
#  VacaySync Dev Startup Script
#  Runs backend (FastAPI) + frontend (React) concurrently
#
#  USAGE:
#    ./start.sh                  # Default: regenerate seed data
#    ./start.sh --reseed         # Explicitly regenerate seed data
#    ./start.sh --no-reseed      # Skip seed data regeneration
#
#  CONFIG — adjust these to match your project layout:
# ─────────────────────────────────────────────
BACKEND_DIR="./backend"          # path to your FastAPI folder
FRONTEND_DIR="./frontend"        # path to your React folder
BACKEND_CMD="uv run main.py"
FRONTEND_CMD="npm run dev"       # or: npm start
LOG_DIR="./logs"                 # where log files are saved
# ─────────────────────────────────────────────

# Parse command-line arguments
RESEED_FLAG=""
if [[ "$1" == "--no-reseed" ]]; then
  RESEED_FLAG="--no-reseed"
elif [[ "$1" == "--reseed" ]]; then
  RESEED_FLAG="--reseed"
fi

# Add flag to backend command if provided
if [ -n "$RESEED_FLAG" ]; then
  BACKEND_CMD="$BACKEND_CMD $RESEED_FLAG"
fi

# Colors for log prefixes
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

BACKEND_PID=""
FRONTEND_PID=""

# Timestamp helper — prefixes every line with [HH:MM:SS]
timestamp() {
  while IFS= read -r line; do
    echo "[$(date '+%H:%M:%S')] $line"
  done
}

# Cleanup: kill both processes on Ctrl+C or exit
cleanup() {
  echo -e "\n${YELLOW}Shutting down...${NC}"
  [ -n "$BACKEND_PID" ]  && kill "$BACKEND_PID"  2>/dev/null
  [ -n "$FRONTEND_PID" ] && kill "$FRONTEND_PID" 2>/dev/null
  wait
  echo -e "${GREEN}Both servers stopped.${NC}"
  echo -e "  Logs saved to: ${YELLOW}${SESSION_DIR}/${NC}"
  exit 0
}
trap cleanup SIGINT SIGTERM

# Create a timestamped session folder inside LOG_DIR
SESSION="$(date '+%Y-%m-%d_%H-%M-%S')"
SESSION_DIR="${LOG_DIR}/${SESSION}"
mkdir -p "$SESSION_DIR"

BACKEND_LOG="${SESSION_DIR}/backend.log"
FRONTEND_LOG="${SESSION_DIR}/frontend.log"

echo -e "${BLUE}╔══════════════════════════════╗${NC}"
echo -e "${BLUE}║   TravelBook Dev Server      ║${NC}"
echo -e "${BLUE}╚══════════════════════════════╝${NC}"
echo -e "  Session logs: ${YELLOW}${SESSION_DIR}/${NC}"
if [ -n "$RESEED_FLAG" ]; then
  echo -e "  Database mode: ${YELLOW}${RESEED_FLAG}${NC}"
else
  echo -e "  Database mode: ${YELLOW}default (reseed enabled)${NC}"
fi
echo ""

# ── Backend ──────────────────────────────────
if [ ! -d "$BACKEND_DIR" ]; then
  echo -e "${RED}[ERROR] Backend directory not found: $BACKEND_DIR${NC}"
  echo "  Update BACKEND_DIR at the top of this script."
  exit 1
fi

echo -e "${GREEN}[backend]${NC} Starting FastAPI... (log: ${BACKEND_LOG})"
(
  cd "$BACKEND_DIR" || exit 1
  $BACKEND_CMD 2>&1 | timestamp | tee "$BACKEND_LOG" \
    | sed "s/^/$(printf '\033[0;32m')[backend]$(printf '\033[0m') /"
) &
BACKEND_PID=$!

# ── Frontend ─────────────────────────────────
if [ ! -d "$FRONTEND_DIR" ]; then
  echo -e "${RED}[ERROR] Frontend directory not found: $FRONTEND_DIR${NC}"
  echo "  Update FRONTEND_DIR at the top of this script."
  kill "$BACKEND_PID" 2>/dev/null
  exit 1
fi

echo -e "${BLUE}[frontend]${NC} Starting React... (log: ${FRONTEND_LOG})"
(
  cd "$FRONTEND_DIR" || exit 1
  $FRONTEND_CMD 2>&1 | timestamp | tee "$FRONTEND_LOG" \
    | sed "s/^/$(printf '\033[0;34m')[frontend]$(printf '\033[0m') /"
) &
FRONTEND_PID=$!

echo -e "\n${YELLOW}─────────────────────────────────${NC}"
echo -e "  Backend PID:  ${BACKEND_PID}"
echo -e "  Frontend PID: ${FRONTEND_PID}"
echo -e "  Press ${YELLOW}Ctrl+C${NC} to stop both servers."
echo -e "${YELLOW}─────────────────────────────────${NC}\n"

# Tail both log files so you can grep/search them live if needed
# Wait for both processes; exit if either crashes
wait -n 2>/dev/null || {
  wait "$BACKEND_PID" "$FRONTEND_PID"
}

cleanup
