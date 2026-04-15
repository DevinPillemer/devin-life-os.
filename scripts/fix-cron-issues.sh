#!/usr/bin/env bash
# fix-cron-issues.sh
# Diagnoses and fixes cron/daemon issues on macOS for the openclaw stack.
# Usage: bash scripts/fix-cron-issues.sh
# Run from any directory — no arguments required.
#
# Checks performed:
#   1. ScreenPipe — running/restarts if dead
#   2. Himalaya CLI — installs via brew if missing
#   3. gcalcli — re-auth flow if needed
#   4. Stale lock files — clears ~/.openclaw/workspace/memory/*lock*
#   5. VPS connectivity — ping 89.167.94.242
#   6. Local crontab — verifies entries exist
#   7. LaunchAgents — checks openclaw/theo/tomer/tim/tony agents are loaded
#   8. Telegram bot tokens — validates each token via getMe API

set -uo pipefail

# ── Colours ────────────────────────────────────────────────────────
RED='\033[0;31m'
GRN='\033[0;32m'
YLW='\033[1;33m'
BLU='\033[0;34m'
DIM='\033[2m'
NC='\033[0m'

ok()   { echo -e "${GRN}[OK]${NC}    $*"; }
warn() { echo -e "${YLW}[WARN]${NC}  $*"; }
err()  { echo -e "${RED}[ERR]${NC}   $*"; }
info() { echo -e "${BLU}[INFO]${NC}  $*"; }
fix()  { echo -e "${YLW}[FIX]${NC}   $*"; }
sep()  { echo -e "${DIM}────────────────────────────────────────────────${NC}"; }

OPENCLAW_DIR="${HOME}/.openclaw"
ENV_FILE="${OPENCLAW_DIR}/.env"
WORKSPACE="${OPENCLAW_DIR}/workspace"
MEMORY_DIR="${WORKSPACE}/memory"
VPS_IP="89.167.94.242"

ERRORS=0
FIXES=0

header() {
  echo ""
  echo -e "${BLU}══════════════════════════════════════════════════${NC}"
  echo -e "${BLU}  OpenClaw Fix Script  —  $(date '+%Y-%m-%d %H:%M:%S')${NC}"
  echo -e "${BLU}══════════════════════════════════════════════════${NC}"
  echo ""
}

# ── Helper: load .env ───────────────────────────────────────────────
load_env() {
  if [[ ! -f "$ENV_FILE" ]]; then
    return
  fi
  while IFS= read -r line || [[ -n "$line" ]]; do
    # Skip blank lines and comments
    [[ -z "$line" || "$line" =~ ^[[:space:]]*# ]] && continue
    [[ "$line" != *"="* ]] && continue
    local key="${line%%=*}"
    local val="${line#*=}"
    # Strip surrounding quotes
    val="${val%\"}"
    val="${val#\"}"
    val="${val%\'}"
    val="${val#\'}"
    # Only export if not already set in environment
    if [[ -z "${!key+x}" ]]; then
      export "$key"="$val"
    fi
  done < "$ENV_FILE"
}

# ──────────────────────────────────────────────────────────────────
header
load_env

# ──────────────────────────────────────────────────────────────────
# 1. SCREENPIPE
# ──────────────────────────────────────────────────────────────────
echo "── 1. ScreenPipe ──────────────────────────────────"
sep

if pgrep -f screenpipe > /dev/null 2>&1; then
  SP_PID=$(pgrep -f screenpipe | head -1)
  ok "ScreenPipe is running (PID ${SP_PID})"

  # Sanity-check it's actually capturing (data dir should have recent files)
  SP_DATA="${HOME}/Library/Application Support/screenpipe"
  if [[ -d "$SP_DATA" ]]; then
    RECENT=$(find "$SP_DATA" -mmin -10 -type f 2>/dev/null | wc -l | tr -d ' ')
    if [[ "$RECENT" -gt 0 ]]; then
      ok "ScreenPipe capturing — ${RECENT} file(s) written in last 10 min"
    else
      warn "ScreenPipe running but no recent output in last 10 min — may be frozen"
      fix "Killing and restarting frozen ScreenPipe process..."
      pkill -f screenpipe 2>/dev/null || true
      sleep 2
      open -a ScreenPipe 2>/dev/null || true
      sleep 3
      if pgrep -f screenpipe > /dev/null 2>&1; then
        ok "ScreenPipe restarted"
        FIXES=$((FIXES + 1))
      else
        err "ScreenPipe restart failed — check app installation"
        ERRORS=$((ERRORS + 1))
      fi
    fi
  fi
else
  warn "ScreenPipe is NOT running — attempting to start..."

  # Try .app first
  if open -a ScreenPipe 2>/dev/null; then
    sleep 4
    if pgrep -f screenpipe > /dev/null 2>&1; then
      ok "ScreenPipe launched via .app"
      FIXES=$((FIXES + 1))
    else
      info "App opened but process not detected yet — may still be loading"
    fi
  else
    # Try direct binary
    SP_BIN=$(command -v screenpipe 2>/dev/null || true)
    if [[ -n "$SP_BIN" ]]; then
      fix "Launching screenpipe binary: ${SP_BIN}"
      nohup "$SP_BIN" >> /tmp/screenpipe-fix.log 2>&1 &
      sleep 3
      if pgrep -f screenpipe > /dev/null 2>&1; then
        ok "ScreenPipe started via binary (log: /tmp/screenpipe-fix.log)"
        FIXES=$((FIXES + 1))
      else
        err "ScreenPipe binary launch failed — see /tmp/screenpipe-fix.log"
        ERRORS=$((ERRORS + 1))
      fi
    else
      err "ScreenPipe not found. Install from: https://screenpi.pe"
      ERRORS=$((ERRORS + 1))
    fi
  fi
fi
echo ""

# ──────────────────────────────────────────────────────────────────
# 2. HIMALAYA CLI
# ──────────────────────────────────────────────────────────────────
echo "── 2. Himalaya CLI ────────────────────────────────"
sep

if command -v himalaya > /dev/null 2>&1; then
  HIM_VER=$(himalaya --version 2>/dev/null | head -1 || echo "version unknown")
  ok "himalaya installed: ${HIM_VER}"
else
  warn "himalaya not found — installing..."
  if command -v brew > /dev/null 2>&1; then
    if brew install himalaya 2>&1; then
      if command -v himalaya > /dev/null 2>&1; then
        ok "himalaya installed: $(himalaya --version 2>/dev/null | head -1)"
        FIXES=$((FIXES + 1))
      else
        err "brew install succeeded but himalaya still not in PATH"
        info "Try: eval \"\$(/opt/homebrew/bin/brew shellenv)\" and re-run"
        ERRORS=$((ERRORS + 1))
      fi
    else
      err "brew install himalaya failed"
      info "Manual install: https://github.com/soywod/himalaya/releases"
      ERRORS=$((ERRORS + 1))
    fi
  else
    err "Homebrew not found — cannot install himalaya automatically"
    info "Install Homebrew: https://brew.sh then run: brew install himalaya"
    ERRORS=$((ERRORS + 1))
  fi
fi
echo ""

# ──────────────────────────────────────────────────────────────────
# 3. GCALCLI AUTH
# ──────────────────────────────────────────────────────────────────
echo "── 3. gcalcli Auth ────────────────────────────────"
sep

if command -v gcalcli > /dev/null 2>&1; then
  GCAL_TEST=$(gcalcli list 2>&1 | head -5 || true)
  if echo "$GCAL_TEST" | grep -qiE "error|oauth|auth|token|credential|expired|invalid|not authenticated"; then
    warn "gcalcli auth appears stale — initiating re-auth flow..."
    info "This will open a browser window or print an auth URL."
    info "If running non-interactively, visit the URL printed below."
    echo ""
    gcalcli list --noauth_local_webserver 2>&1 | head -10 || {
      err "gcalcli re-auth failed. Run manually:"
      info "  gcalcli --noauth_local_webserver list"
      ERRORS=$((ERRORS + 1))
    }
  elif echo "$GCAL_TEST" | grep -qE "^\s*[0-9]+|^[A-Z][a-z]"; then
    ok "gcalcli auth valid — calendar data returned"
  else
    info "gcalcli output:"
    echo "$GCAL_TEST" | while IFS= read -r l; do info "  $l"; done
  fi
else
  warn "gcalcli not installed"
  if command -v pip3 > /dev/null 2>&1; then
    fix "Installing gcalcli via pip3..."
    pip3 install --quiet gcalcli && ok "gcalcli installed" || {
      err "pip3 install gcalcli failed — try: pip3 install gcalcli --break-system-packages"
      ERRORS=$((ERRORS + 1))
    }
  else
    err "pip3 not found — install gcalcli manually: pip install gcalcli"
    ERRORS=$((ERRORS + 1))
  fi
fi
echo ""

# ──────────────────────────────────────────────────────────────────
# 4. STALE LOCK FILES
# ──────────────────────────────────────────────────────────────────
echo "── 4. Stale Lock Files ────────────────────────────"
sep

LOCK_COUNT=0
CLEARED=0

# Primary location
if [[ -d "$MEMORY_DIR" ]]; then
  while IFS= read -r -d '' lockfile; do
    LOCK_COUNT=$((LOCK_COUNT + 1))
    AGE_MIN=$(( ( $(date +%s) - $(stat -f %m "$lockfile" 2>/dev/null || echo 0) ) / 60 ))
    fix "Removing lock (age: ${AGE_MIN}min): $(basename "$lockfile")"
    rm -f "$lockfile"
    CLEARED=$((CLEARED + 1))
  done < <(find "$MEMORY_DIR" -name "*lock*" -print0 2>/dev/null)
fi

# Also catch workspace-level locks older than 30 min
while IFS= read -r -d '' lockfile; do
  LOCK_COUNT=$((LOCK_COUNT + 1))
  AGE_MIN=$(( ( $(date +%s) - $(stat -f %m "$lockfile" 2>/dev/null || echo 0) ) / 60 ))
  if [[ $AGE_MIN -gt 30 ]]; then
    fix "Removing stale workspace lock (age: ${AGE_MIN}min): $(basename "$lockfile")"
    rm -f "$lockfile"
    CLEARED=$((CLEARED + 1))
  else
    info "Skipping recent lock (age: ${AGE_MIN}min, <30min): $(basename "$lockfile")"
  fi
done < <(find "$WORKSPACE" -maxdepth 2 -name "*.lock" -not -path "*/memory/*" -print0 2>/dev/null)

if [[ $LOCK_COUNT -eq 0 ]]; then
  ok "No stale lock files found"
else
  ok "Cleared ${CLEARED}/${LOCK_COUNT} lock file(s)"
  FIXES=$((FIXES + CLEARED))
fi
echo ""

# ──────────────────────────────────────────────────────────────────
# 5. VPS CONNECTIVITY
# ──────────────────────────────────────────────────────────────────
echo "── 5. VPS Connectivity — ${VPS_IP} ──────"
sep

PING_OUT=$(ping -c 3 -W 2000 "$VPS_IP" 2>&1 || true)
if echo "$PING_OUT" | grep -q "3 packets transmitted, 3 received"; then
  RTT=$(echo "$PING_OUT" | tail -1 | awk -F'/' '{printf "%.1f", $5}' 2>/dev/null || echo "?")
  ok "VPS reachable — avg RTT: ${RTT}ms"
elif echo "$PING_OUT" | grep -qE "packets transmitted.*received"; then
  RECV=$(echo "$PING_OUT" | grep -oE '[0-9]+ received' | awk '{print $1}')
  warn "VPS partially reachable — only ${RECV}/3 pings returned"
  ERRORS=$((ERRORS + 1))
else
  err "VPS at ${VPS_IP} is UNREACHABLE"
  info "Possible causes: server down, firewall blocking ICMP, network issue"
  info "Manual check: ssh root@${VPS_IP} 'uptime; systemctl status cron; df -h'"
  ERRORS=$((ERRORS + 1))
fi

# Try SSH health check if ssh is available and VPS responded
if command -v ssh > /dev/null 2>&1 && echo "$PING_OUT" | grep -q "received"; then
  SSH_CHECK=$(ssh -o ConnectTimeout=10 \
                  -o BatchMode=yes \
                  -o StrictHostKeyChecking=no \
                  -o LogLevel=ERROR \
                  "root@${VPS_IP}" \
                  'printf "uptime:%s\ncron:%s\ndisk:%s\n" \
                    "$(uptime | awk -F"load" "{print \$1}" | xargs)" \
                    "$(systemctl is-active cron 2>/dev/null || systemctl is-active cronie 2>/dev/null || echo unknown)" \
                    "$(df -h / | awk "NR==2{print \$5}" )"' 2>&1 || true)

  if [[ -n "$SSH_CHECK" ]] && ! echo "$SSH_CHECK" | grep -qi "error\|denied\|failed\|refused"; then
    UPTIME_LINE=$(echo "$SSH_CHECK" | grep "^uptime:" | cut -d: -f2-)
    CRON_LINE=$(echo "$SSH_CHECK" | grep "^cron:" | cut -d: -f2)
    DISK_LINE=$(echo "$SSH_CHECK" | grep "^disk:" | cut -d: -f2)
    ok "SSH OK — uptime:${UPTIME_LINE}"
    if [[ "$CRON_LINE" == "active" ]]; then
      ok "VPS cron: active"
    else
      warn "VPS cron status: ${CRON_LINE:-unknown}"
    fi
    if [[ -n "$DISK_LINE" ]]; then
      DISK_PCT="${DISK_LINE%%%*}"
      if [[ "$DISK_PCT" -gt 90 ]] 2>/dev/null; then
        warn "VPS disk usage HIGH: ${DISK_LINE}"
        ERRORS=$((ERRORS + 1))
      else
        ok "VPS disk: ${DISK_LINE} used"
      fi
    fi
  else
    info "SSH not available non-interactively (key auth may be needed)"
    info "Run: ssh root@${VPS_IP} 'uptime; systemctl status cron; df -h'"
  fi
fi
echo ""

# ──────────────────────────────────────────────────────────────────
# 6. LOCAL CRONTAB
# ──────────────────────────────────────────────────────────────────
echo "── 6. Local Crontab ───────────────────────────────"
sep

CRONTAB_RAW=$(/usr/bin/crontab -l 2>/dev/null || true)
ACTIVE_LINES=$(echo "$CRONTAB_RAW" | grep -v '^[[:space:]]*#' | grep -v '^[[:space:]]*$' || true)
ENTRY_COUNT=$(echo "$ACTIVE_LINES" | grep -c '.' 2>/dev/null || echo 0)

if [[ "$ENTRY_COUNT" -eq 0 ]]; then
  warn "crontab is empty — no scheduled jobs"
  info "Expected jobs: ibkr refresh, git backup, proactive scan, outreach"
  ERRORS=$((ERRORS + 1))
else
  ok "crontab has ${ENTRY_COUNT} active entr$([ "$ENTRY_COUNT" -eq 1 ] && echo y || echo ies)"
  echo "$ACTIVE_LINES" | while IFS= read -r line; do
    [[ -z "$line" ]] && continue
    # Highlight lines with very short timeout wrappers
    if echo "$line" | grep -qE 'timeout [0-9]+'; then
      T=$(echo "$line" | grep -oE 'timeout [0-9]+' | awk '{print $2}' | head -1)
      if [[ "$T" -lt 120 ]] 2>/dev/null; then
        warn "  Short timeout (${T}s): $line"
      else
        info "  $line"
      fi
    else
      info "  $line"
    fi
  done
fi
echo ""

# ──────────────────────────────────────────────────────────────────
# 7. LAUNCHAGENTS
# ──────────────────────────────────────────────────────────────────
echo "── 7. LaunchAgents ────────────────────────────────"
sep

AGENT_PATTERN='openclaw|floopify|screenpipe|ibkr|himalaya|theo|tomer|tim|tony'
LOADED=$(launchctl list 2>/dev/null | grep -iE "$AGENT_PATTERN" || true)

if [[ -z "$LOADED" ]]; then
  warn "No matching LaunchAgents found (pattern: openclaw|theo|tomer|tim|tony|...)"
  info "If agents should exist, load them from ~/Library/LaunchAgents/"
else
  AGENT_COUNT=$(echo "$LOADED" | wc -l | tr -d ' ')
  ok "Found ${AGENT_COUNT} matching LaunchAgent(s):"
  echo ""

  while IFS= read -r line; do
    [[ -z "$line" ]] && continue
    APID=$(echo "$line" | awk '{print $1}')
    ASTATUS=$(echo "$line" | awk '{print $2}')
    ANAME=$(echo "$line" | awk '{print $3}')
    if [[ "$APID" == "-" ]]; then
      warn "  NOT RUNNING  ${ANAME}  (last exit code: ${ASTATUS})"
    else
      ok "  RUNNING (PID ${APID})  ${ANAME}"
    fi
  done <<< "$LOADED"
fi

echo ""

# Attempt to reload any stopped openclaw agents from plist files
LAUNCH_DIRS=("${HOME}/Library/LaunchAgents" "/Library/LaunchAgents")
RELOADED=0
for LDIR in "${LAUNCH_DIRS[@]}"; do
  [[ -d "$LDIR" ]] || continue
  while IFS= read -r -d '' plist; do
    LABEL=$(defaults read "$plist" Label 2>/dev/null || basename "$plist" .plist)
    echo "$LABEL" | grep -qiE 'openclaw|floopify|ibkr|outreach|backup|proactive|theo|tomer|tim|tony' || continue

    RUNNING=$(launchctl list "$LABEL" 2>/dev/null | grep '"PID"' || true)
    if [[ -z "$RUNNING" ]]; then
      fix "Reloading stopped agent: ${LABEL}"
      launchctl unload "$plist" 2>/dev/null || true
      if launchctl load "$plist" 2>/dev/null; then
        sleep 1
        VERIFY=$(launchctl list "$LABEL" 2>/dev/null | grep '"PID"' || true)
        if [[ -n "$VERIFY" ]]; then
          ok "  Reloaded and running: ${LABEL}"
        else
          info "  Reloaded (may start on next trigger): ${LABEL}"
        fi
        RELOADED=$((RELOADED + 1))
        FIXES=$((FIXES + 1))
      else
        err "  Failed to reload: ${LABEL}"
        ERRORS=$((ERRORS + 1))
      fi
    fi
  done < <(find "$LDIR" -name "*.plist" -print0 2>/dev/null)
done

[[ $RELOADED -gt 0 ]] && ok "Reloaded ${RELOADED} agent(s)" || true
echo ""

# ──────────────────────────────────────────────────────────────────
# 8. TELEGRAM BOT TOKENS
# ──────────────────────────────────────────────────────────────────
echo "── 8. Telegram Bot Tokens ─────────────────────────"
sep

if [[ ! -f "$ENV_FILE" ]]; then
  warn "No .env file at ${ENV_FILE} — skipping token checks"
  info "Create ${ENV_FILE} with TELEGRAM_BOT_TOKEN_* entries"
else
  # Collect all telegram token vars from .env
  TOKEN_LINES=$(grep -E 'TELEGRAM.*TOKEN|BOT_TOKEN' "$ENV_FILE" 2>/dev/null | grep -v '^[[:space:]]*#' || true)

  if [[ -z "$TOKEN_LINES" ]]; then
    warn "No TELEGRAM_BOT_TOKEN_* entries found in ${ENV_FILE}"
  else
    TOKEN_OK=0
    TOKEN_FAIL=0

    while IFS= read -r tline; do
      [[ -z "$tline" ]] && continue
      TVAR="${tline%%=*}"
      TVAL="${tline#*=}"
      TVAL="${TVAL%\"}"
      TVAL="${TVAL#\"}"
      TVAL="${TVAL%\'}"
      TVAL="${TVAL#\'}"
      TVAL=$(echo "$TVAL" | tr -d '[:space:]')

      if [[ -z "$TVAL" ]]; then
        warn "  ${TVAR}: EMPTY — no token set"
        TOKEN_FAIL=$((TOKEN_FAIL + 1))
        ERRORS=$((ERRORS + 1))
        continue
      fi

      # Call Telegram getMe
      TGME=$(curl -sf --max-time 8 \
        "https://api.telegram.org/bot${TVAL}/getMe" 2>/dev/null || echo '{"ok":false,"description":"curl failed"}')

      if echo "$TGME" | python3 -c "import sys,json; sys.exit(0 if json.load(sys.stdin).get('ok') else 1)" 2>/dev/null; then
        BOT_USERNAME=$(echo "$TGME" | python3 -c "import sys,json; print(json.load(sys.stdin)['result']['username'])" 2>/dev/null || echo "unknown")
        BOT_NAME=$(echo "$TGME" | python3 -c "import sys,json; print(json.load(sys.stdin)['result']['first_name'])" 2>/dev/null || echo "")
        ok "  ${TVAR} → @${BOT_USERNAME} (${BOT_NAME}): VALID"
        TOKEN_OK=$((TOKEN_OK + 1))
      else
        TG_ERR=$(echo "$TGME" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('description','unknown error'))" 2>/dev/null || echo "invalid response")
        err "  ${TVAR}: INVALID — ${TG_ERR}"
        info "    Token prefix: ${TVAL:0:10}..."
        TOKEN_FAIL=$((TOKEN_FAIL + 1))
        ERRORS=$((ERRORS + 1))
      fi
    done <<< "$TOKEN_LINES"

    echo ""
    [[ $TOKEN_OK -gt 0 ]]   && ok   "${TOKEN_OK} token(s) valid"
    [[ $TOKEN_FAIL -gt 0 ]] && warn "${TOKEN_FAIL} token(s) invalid — update in ${ENV_FILE}"
  fi
fi
echo ""

# ──────────────────────────────────────────────────────────────────
# SUMMARY
# ──────────────────────────────────────────────────────────────────
echo -e "${BLU}══════════════════════════════════════════════════${NC}"
echo -e "${BLU}  Summary${NC}"
echo -e "${BLU}══════════════════════════════════════════════════${NC}"
echo ""

if [[ $FIXES -gt 0 ]]; then
  ok "Auto-fixed: ${FIXES} issue(s)"
fi

if [[ $ERRORS -eq 0 ]]; then
  ok "All checks passed — stack looks healthy"
  echo ""
  exit 0
else
  err "${ERRORS} issue(s) require manual attention (see above)"
  echo ""
  echo -e "${YLW}Quick fixes:${NC}"
  echo "  ScreenPipe:    open -a ScreenPipe"
  echo "  himalaya:      brew install himalaya"
  echo "  gcalcli:       gcalcli --noauth_local_webserver list"
  echo "  VPS:           ssh root@${VPS_IP} 'uptime; systemctl status cron; df -h'"
  echo "  IBKR tokens:   python3 ~/.openclaw/workspace/refresh_ibkr_prices.py"
  echo "  Outreach:      python3 scripts/fix-proactive-outreach.py --slot morning"
  echo ""
  exit 1
fi
