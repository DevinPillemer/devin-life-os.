# BruBot Morning Email Stack

9 daily briefing emails sent to devin.pillemer@gmail.com at **6:00 AM Israel time, every day** (7 days/week).

## Emails
1. 🏃 Health Insights (Garmin + Strava)
2. 💰 Financial Dashboard (IBKR + Budget Sheets)
3. 💼 Job Alerts
4. 🎧 Daily Learning (Podcasts)
5. 📰 News Daily
6. 🛒 FB Deals of the Day
7. 📅 Calendar Briefing + Insights
8. 📬 Inbox Zero Hero (Top 10 Gmail)
9. 🎯 Daily Goals Priority (Notion)

## Usage

### Run immediately (test all 9 emails now)
```bash
source /root/.openclaw/.env && python3 morning_email_stack.py --test
```

### Run via wrapper (logs to file)
```bash
./run_morning_emails.sh --test
```

### Install/update cron job
```bash
./config/install_cron.sh
```

### Check logs
```bash
tail -50 logs/morning_email.log
```

## Credentials
All credentials are loaded from:
- `/root/.openclaw/.env` — GARMIN_EMAIL, GARMIN_PASSWORD, NOTION_API_KEY, OPENAI_API_KEY
- `/root/.config/google/gmail_token.json` — Gmail/Sheets/Calendar OAuth
- `/root/.config/strava-training-coach/strava_tokens.json` — Strava

## Re-auth Google (if token expires)
```bash
python3 /root/.openclaw/workspace/google_auth_refresh.py
```
Or use the Desktop OAuth flow:
1. Generate auth URL and open it
2. Paste the code back to BruBot
3. Tokens auto-saved to all `/root/.config/google/*.json` files

## Known Issues
- FB Deals Hebrew queries sometimes timeout (non-critical, email sends anyway)
- News ranked_news occasionally hits JSON parse error (email still sends with raw content)

## Schedule
Cron: `CRON_TZ=Asia/Jerusalem` + `0 6 * * *` — **6:00 AM Israel time, every day** (DST-aware via `Asia/Jerusalem` tz).
To install or update: `./config/install_cron.sh`
