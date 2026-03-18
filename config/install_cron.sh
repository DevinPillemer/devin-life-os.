#!/bin/bash
# Installs the morning email cron job:
#   6:00 AM Israel time (Asia/Jerusalem), Mon–Fri
#   Runs via Claude Code CLI (claude-sonnet-4-6), git pulls, then runs morning_email_stack.py
# Run this script to register/update the cron entry

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# Remove existing morning email cron entry if any
(crontab -l 2>/dev/null | grep -v "morning_email\|morning-emails\|run_morning") | crontab -

# Add the new entry:
#   CRON_TZ=Asia/Jerusalem — exact 6:00 AM Israel time, DST-aware
#   0 6 * * 1-5            — Mon–Fri only
#   run_morning_claude.sh  — Claude Code (claude-sonnet-4-6) runner
(crontab -l 2>/dev/null; printf 'CRON_TZ=Asia/Jerusalem\n0 6 * * 1-5 /bin/bash %s/config/run_morning_claude.sh >> %s/logs/morning_email.log 2>&1\n' "$SCRIPT_DIR" "$SCRIPT_DIR") | crontab -

echo "✅ Cron installed (6:00 AM Asia/Jerusalem, Mon–Fri, Claude Code claude-sonnet-4-6):"
crontab -l | grep -A1 "CRON_TZ\|morning"
