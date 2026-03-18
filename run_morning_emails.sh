#!/bin/bash
# BruBot Morning Email Stack Runner
# Runs the 9-email briefing and logs results

source /root/.openclaw/.env
cd /root/projects/morning-emails

# Ensure log directory exists
mkdir -p /root/.openclaw/workspace/logs

# Run the script with all args passed through
python3 morning_email_stack.py "$@" >> /root/.openclaw/workspace/logs/morning_email.log 2>&1
EXIT_CODE=$?

# Log the exit
echo "[$(date '+%H:%M:%S')] Exit code: $EXIT_CODE" >> /root/.openclaw/workspace/logs/morning_email.log

exit $EXIT_CODE
