# Claude Telegram Bot Setup

Bot: @devin_claude_code_bot  
Package: custom Python bot (pure requests, no framework)  
Location: ~/claude-telegram/  

## Files

- `~/claude-telegram/bot.py` — main bot (Python, requests-based)
- `~/claude-telegram/start.sh` — start script (loads .env, starts bot)
- `~/claude-telegram/.env` — credentials (TELEGRAM_BOT_TOKEN)
- `~/claude-telegram/claude-telegram.yaml` — legacy config (unused by Python bot)
- `~/claude-telegram/data/sessions.json` — session state
- `~/claude-telegram/bot.log` — runtime logs
- `~/claude-telegram/bot.pid` — current PID

## Start the Bot

```bash
cd ~/claude-telegram && bash start.sh
```

## Monitor

```bash
tail -f ~/claude-telegram/bot.log
```

## Stop

```bash
kill $(cat ~/claude-telegram/bot.pid)
```

## Restart

```bash
bash ~/claude-telegram/start.sh
```

## Why this approach

The previous `claude-code-telegram` v1.5.0 had an auth persistence bug:
- It checked `claude auth status` before EVERY message
- In Claude Code remote sessions, auth uses a session OAuth fd that isn't
  available in clean subprocess shells → "Not logged in" after "Welcome"

This custom bot:
- Uses `claude -p --output-format stream-json` directly
- No per-message auth check
- Uses requests library (auto-respects HTTPS_PROXY from environment)
- Maintains conversation sessions via --session-id / --resume flags
- Threads per user so multiple users can be served concurrently

## Auth persistence note

Claude CLI is authenticated via the Claude Code session OAuth. When
a session ends, you may need to run `claude login` or set
ANTHROPIC_API_KEY in .env for the bot to keep working.
