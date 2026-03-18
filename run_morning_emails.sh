#!/bin/bash
# BruBot Morning Email Stack — Daily runner
# Auto-pulls latest code from GitHub (DevinPillemer/devin-life-os. @ morning-emails branch)
# then runs the 9-email stack.

set -e
SCRIPT_DIR="/root/projects/morning-emails"
LOG="$SCRIPT_DIR/logs/morning_email.log"
mkdir -p "$SCRIPT_DIR/logs"

echo "[$(date '+%H:%M:%S')] === MORNING EMAIL RUN STARTING ===" >> "$LOG"

# Source env vars
source /root/.openclaw/.env

# Refresh GitHub App installation token (1hr lifetime, so regenerate each run)
GH_TOKEN=$(python3 /root/projects/morning-emails/config/get_gh_token.py 2>/dev/null)
if [ -n "$GH_TOKEN" ]; then
    cd "$SCRIPT_DIR"
    git remote set-url origin "https://x-access-token:${GH_TOKEN}@github.com/DevinPillemer/devin-life-os."
    git pull --quiet origin morning-emails >> "$LOG" 2>&1 && \
        echo "[$(date '+%H:%M:%S')] ✅ Pulled latest code from morning-emails branch" >> "$LOG" || \
        echo "[$(date '+%H:%M:%S')] ⚠️  Git pull failed — running with existing code" >> "$LOG"
else
    echo "[$(date '+%H:%M:%S')] ⚠️  Could not refresh GH token — running with existing code" >> "$LOG"
fi

# Run the email stack
cd "$SCRIPT_DIR"
python3 morning_email_stack.py >> "$LOG" 2>&1
EXIT_CODE=$?

echo "[$(date '+%H:%M:%S')] Exit code: $EXIT_CODE" >> "$LOG"
exit $EXIT_CODE
