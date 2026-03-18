#!/bin/bash
# BruBot Morning Email Stack — Claude Code scheduled runner
# Invoked by cron at 6:00 AM Israel time, Mon–Fri
# Uses: claude --model claude-sonnet-4-6 (non-interactive, bypass permissions)

set -e
SCRIPT_DIR="/root/projects/morning-emails"
LOG="$SCRIPT_DIR/logs/morning_email.log"
mkdir -p "$SCRIPT_DIR/logs"

echo "[$(date '+%H:%M:%S')] === CLAUDE CODE MORNING EMAIL RUN STARTING ===" >> "$LOG"

# Source env vars (ANTHROPIC_API_KEY, NOTION_API_KEY, etc.)
source /root/.openclaw/.env

# Pull latest code from morning-emails branch
echo "[$(date '+%H:%M:%S')] Pulling latest from morning-emails branch..." >> "$LOG"
cd "$SCRIPT_DIR"
git pull origin morning-emails >> "$LOG" 2>&1 && \
    echo "[$(date '+%H:%M:%S')] ✅ Git pull succeeded" >> "$LOG" || \
    echo "[$(date '+%H:%M:%S')] ⚠️  Git pull failed — running with existing code" >> "$LOG"

# Run via Claude Code (claude-sonnet-4-6), non-interactive, permissions pre-approved
echo "[$(date '+%H:%M:%S')] Starting claude-sonnet-4-6 run..." >> "$LOG"
claude \
    --model claude-sonnet-4-6 \
    --dangerously-skip-permissions \
    -p "Run the morning email stack: execute \`python3 morning_email_stack.py\` in the current directory (/root/projects/morning-emails). Source /root/.openclaw/.env first if needed. Report the result." \
    >> "$LOG" 2>&1

EXIT_CODE=$?
echo "[$(date '+%H:%M:%S')] Claude Code exit code: $EXIT_CODE" >> "$LOG"
exit $EXIT_CODE
