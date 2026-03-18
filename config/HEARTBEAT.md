# HEARTBEAT.md
# BruBot Proactive Check List — Updated 2026-03-16

## ⚡ Quick State (update after each heartbeat)
```json
{
  "lastChecks": {
    "email": 1773652920000,
    "calendar": 1773618000000,
    "strava": 1773618000000,
    "habitify": null,
    "portfolio": 1773423600000,
    "n8n": 1773618000000
  },
  "lastProactiveActions": [
    "2026-03-13 07:00 — Podcast scan (no new episodes), generated OpenClaw Skills Bundle #1, updated HEARTBEAT.md, created MODEL_ROUTING.md",
    "2026-03-14 04:18 UTC — Strava check attempted, failed due to expired token.",
    "2026-03-14 04:20 UTC — Kubera portfolio check attempted, failed due to invalid API key.",
    "2026-03-14 04:22 UTC — n8n workflow health check completed (reported 100% success).",
    "2026-03-14 04:24 UTC — Gmail check attempted, failed due to missing MATON_API_KEY.",
    "2026-03-16 05:00 UTC — Strava check successful; Calendar checked; n8n workflows reviewed; Kubera check attempted (failed).",
    "2026-03-16 09:19 UTC — Morning Email Stack cron job ran successfully (9/9 emails sent)."
  ],
  "pendingForDevin": [
    "Morning Email Stack script is repeatedly failing (SIGTERM). Investigation needed.",
    "Mac M2 migration plan ready to execute — no Cloudflare for now. Script needs building.",
    "Kubera portfolio check is failing with a '404 Not Found' error; likely requires the correct portfolio ID or a fix to the script."
  ]
}
```

## 📋 Periodic Checks (rotate 2-3 per heartbeat, respect quiet hours 23:00-08:00 IL)

### 🔴 HIGH PRIORITY (check every heartbeat)
- [ ] **Strava / Fitness** — Any new workout? If >2 days since last run, ping Devin gently
- [ ] **Calendar** — Any event in next 2h? Prep reminders, context
- [ ] **Memory review** — Any daily file older than 7 days with unextracted insights?
- [ ] **Morning Email Stack Cron Status** — Verify last run was successful

### 🟡 MEDIUM (check 1-2x daily)
- [ ] **Email (Gmail/Himalaya)** — Urgent unread? Devin's flagged keywords: Panaya, SDR, AE, Lior, Daphna
- [ ] **n8n Workflows** — Any failing executions? Check n8n-workflow-manager skill
- [ ] **Portfolio (Kubera)** — Any >3% daily move? Notify if so

### 🟢 LOW (1-2x weekly)
- [ ] **Habitify** — Weekly streak summary worth sending on Sundays
- [ ] **MEMORY.md maintenance** — Extract weekly → distill into long-term memory
- [ ] **Skill audit** — Any installed skill not used in 30+ days? Flag for removal

## 🧠 Context Priming (read before acting)
Today is Monday → Start of the work week. Devin's top priority: AE hiring at Panaya + Q1 30 meetings target.
Current location: Tel Aviv.

## ❌ DO NOT (reminders to self)
- Do NOT send messages during 23:00-08:00 IL unless urgent/critical
- Do NOT send the same insight twice (check lastProactiveActions above)
- Do NOT pull full MEMORY.md in group/shared contexts
- Do NOT overwrite existing OAuth token files
