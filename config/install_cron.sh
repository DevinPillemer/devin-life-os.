#!/bin/bash
# Installs the morning email cron job at 6:00 AM Israel time (Asia/Jerusalem), every day
# Run this script to register/update the cron entry

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# Remove existing morning email cron entry if any
(crontab -l 2>/dev/null | grep -v "morning_email\|morning-emails") | crontab -

# Add the new one with CRON_TZ inline so it doesn't affect other jobs
# CRON_TZ=Asia/Jerusalem means 0 6 = exactly 6:00 AM Israel time (handles DST automatically)
(crontab -l 2>/dev/null; printf 'CRON_TZ=Asia/Jerusalem\n0 6 * * * /bin/bash %s/run_morning_emails.sh >> %s/logs/morning_email.log 2>&1\n' "$SCRIPT_DIR" "$SCRIPT_DIR") | crontab -

echo "✅ Cron installed (6:00 AM Asia/Jerusalem, every day):"
crontab -l | grep -A1 "CRON_TZ\|morning"
