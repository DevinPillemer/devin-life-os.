#!/bin/bash
# Installs the morning email cron job (6:05 AM Israel time = 4:05 AM UTC, mon-fri)
# Run this script to register/update the cron entry

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# Remove existing morning email cron entry if any
(crontab -l 2>/dev/null | grep -v "morning_email") | crontab -

# Add the new one
(crontab -l 2>/dev/null; echo "5 4 * * 1-5 source /root/.openclaw/.env && cd $SCRIPT_DIR && python3 morning_email_stack.py >> $SCRIPT_DIR/logs/morning_email.log 2>&1") | crontab -

echo "✅ Cron installed:"
crontab -l | grep morning_email
