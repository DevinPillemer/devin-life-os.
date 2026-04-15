#!/usr/bin/env bash
# fix-cron-timeouts.sh
# Shows current timeout settings for long-running jobs and optionally patches them.
#
# Usage:
#   bash scripts/fix-cron-timeouts.sh            # dry-run: audit only, no changes
#   bash scripts/fix-cron-timeouts.sh --apply    # write changes to crontab + plist files
#
# What it fixes:
#   - crontab entries that wrap jobs with 'timeout N' where N is too low
#   - LaunchAgent plists missing TimeOutInterval or with values < recommended
#   - Prints a safe reference crontab template with correct timeouts

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

APPLY=false
[[ "${1:-}" == "--apply" ]] && APPLY=true

# ── Helper: reload a LaunchAgent after editing its plist ───────────
_reload_agent() {
  local label="$1"
  local plist="$2"
  launchctl unload "$plist" 2>/dev/null || true
  if launchctl load "$plist" 2>/dev/null; then
    sleep 1
    if launchctl list "$label" 2>/dev/null | grep -q '"PID"'; then
      ok "  Reloaded and running: ${label}"
    else
      info "  Reloaded (starts on next trigger): ${label}"
    fi
  else
    err "  Failed to reload agent: ${label}"
  fi
}

OPENCLAW_DIR="${HOME}/.openclaw"
WORKSPACE="${OPENCLAW_DIR}/workspace"
LAUNCH_AGENTS_DIR="${HOME}/Library/LaunchAgents"

# ── Timeout thresholds ─────────────────────────────────────────────
# Jobs by keyword → minimum acceptable timeout (seconds)
declare -A JOB_MIN_TIMEOUTS=(
  [ibkr]=600
  [IBKR]=600
  [refresh_ibkr]=600
  [git_backup]=300
  [git.*backup]=300
  [backup.*git]=300
  [proactive_scan]=300
  [proactive.*scan]=300
  [morning_stack]=300
  [morning.*brief]=300
  [outreach]=90
)

FIXES_NEEDED=0
FIXES_APPLIED=0

echo ""
echo -e "${BLU}══════════════════════════════════════════════════${NC}"
echo -e "${BLU}  Cron Timeout Auditor & Fixer  —  $(date '+%Y-%m-%d %H:%M:%S')${NC}"
if $APPLY; then
  echo -e "${YLW}  MODE: APPLY — changes will be written${NC}"
else
  echo -e "${DIM}  MODE: DRY-RUN — use --apply to write changes${NC}"
fi
echo -e "${BLU}══════════════════════════════════════════════════${NC}"
echo ""

# ──────────────────────────────────────────────────────────────────
# Helper: find recommended timeout for a cron line
# ──────────────────────────────────────────────────────────────────
recommended_timeout() {
  local line="$1"
  local rec=180  # default for any job
  for pattern in "${!JOB_MIN_TIMEOUTS[@]}"; do
    if echo "$line" | grep -qiE "$pattern"; then
      local candidate="${JOB_MIN_TIMEOUTS[$pattern]}"
      [[ "$candidate" -gt "$rec" ]] && rec="$candidate"
    fi
  done
  echo "$rec"
}

# ──────────────────────────────────────────────────────────────────
# 1. CRONTAB — inspect and patch timeout wrappers
# ──────────────────────────────────────────────────────────────────
echo "── 1. Crontab timeout wrappers ────────────────────"
sep

CRONTAB_RAW=$(/usr/bin/crontab -l 2>/dev/null || true)
ACTIVE=$( echo "$CRONTAB_RAW" | grep -v '^[[:space:]]*#' | grep -v '^[[:space:]]*$' || true )
ENTRY_COUNT=$(echo "$ACTIVE" | grep -c '.' 2>/dev/null || echo 0)

if [[ "$ENTRY_COUNT" -eq 0 ]]; then
  warn "crontab is empty — nothing to audit"
  info "See the reference template printed at the end of this script"
else
  ok "crontab has ${ENTRY_COUNT} active entr$([ "$ENTRY_COUNT" -eq 1 ] && echo y || echo ies)"
  echo ""

  NEW_CRONTAB="$CRONTAB_RAW"
  PATCHED=0

  while IFS= read -r line; do
    [[ -z "$line" ]] && continue

    if echo "$line" | grep -qE '\btimeout\b'; then
      CURRENT_T=$(echo "$line" | grep -oE 'timeout [0-9]+' | awk '{print $2}' | head -1)
      RECOMMENDED=$(recommended_timeout "$line")
      LABEL=$(echo "$line" | grep -oE '[A-Za-z0-9_/.-]+\.py|[A-Za-z0-9_/.-]+\.sh' | head -1 || echo "job")

      if [[ -n "$CURRENT_T" ]] && [[ "$CURRENT_T" -lt "$RECOMMENDED" ]] 2>/dev/null; then
        warn "  LOW timeout ${CURRENT_T}s (need ${RECOMMENDED}s):  ...${line: -60}"
        FIXES_NEEDED=$((FIXES_NEEDED + 1))

        if $APPLY; then
          ESCAPED=$(printf '%s\n' "$line" | sed 's/[[\.*^$()+?{|]/\\&/g')
          NEW_LINE=$(echo "$line" | sed "s/timeout ${CURRENT_T}/timeout ${RECOMMENDED}/")
          NEW_CRONTAB=$(echo "$NEW_CRONTAB" | sed "s|${line}|${NEW_LINE}|")
          fix "  Patched: timeout ${CURRENT_T}s → ${RECOMMENDED}s  (${LABEL})"
          PATCHED=$((PATCHED + 1))
          FIXES_APPLIED=$((FIXES_APPLIED + 1))
        else
          info "  → Run with --apply to patch: timeout ${CURRENT_T}s → ${RECOMMENDED}s"
        fi
      elif [[ -n "$CURRENT_T" ]]; then
        ok "  Timeout ${CURRENT_T}s OK  (min: ${RECOMMENDED}s):  ${LABEL}"
      fi
    else
      # No timeout wrapper at all on a long-running job
      RECOMMENDED=$(recommended_timeout "$line")
      if [[ "$RECOMMENDED" -gt 180 ]] 2>/dev/null; then
        LABEL=$(echo "$line" | grep -oE '[A-Za-z0-9_/.-]+\.py|[A-Za-z0-9_/.-]+\.sh' | head -1 || echo "this job")
        warn "  No timeout wrapper on long-running job:  ...${line: -60}"
        info "  Recommend wrapping with:  timeout ${RECOMMENDED} ..."
        FIXES_NEEDED=$((FIXES_NEEDED + 1))
      fi
    fi
  done <<< "$ACTIVE"

  if $APPLY && [[ "$PATCHED" -gt 0 ]]; then
    echo "$NEW_CRONTAB" | /usr/bin/crontab -
    ok "crontab written with ${PATCHED} timeout fix(es)"
    echo ""
    info "Updated crontab (active entries):"
    /usr/bin/crontab -l 2>/dev/null | grep -v '^[[:space:]]*#' | grep -v '^[[:space:]]*$' | \
      while IFS= read -r l; do info "  $l"; done
  fi
fi
echo ""

# ──────────────────────────────────────────────────────────────────
# 2. LAUNCHAGENT PLIST — TimeOutInterval
# ──────────────────────────────────────────────────────────────────
echo "── 2. LaunchAgent TimeOutInterval ─────────────────"
sep

AGENT_PATTERN='openclaw|floopify|ibkr|backup|proactive|outreach|morning|theo|tomer|tim|tony'

if [[ ! -d "$LAUNCH_AGENTS_DIR" ]]; then
  warn "LaunchAgents directory not found: ${LAUNCH_AGENTS_DIR}"
else
  MATCHED=0

  while IFS= read -r -d '' plist; do
    LABEL=$(defaults read "$plist" Label 2>/dev/null || basename "$plist" .plist)
    echo "$LABEL" | grep -qiE "$AGENT_PATTERN" || continue
    MATCHED=$((MATCHED + 1))

    echo ""
    info "  Plist: $(basename "$plist")"
    info "  Label: ${LABEL}"

    # Read existing TimeOutInterval
    CURRENT_T=$(defaults read "$plist" TimeOutInterval 2>/dev/null || echo "")

    # Determine recommended timeout for this label
    RECOMMENDED=300
    echo "$LABEL" | grep -qiE 'ibkr' && RECOMMENDED=600
    echo "$LABEL" | grep -qiE 'outreach' && RECOMMENDED=90

    if [[ -z "$CURRENT_T" ]]; then
      warn "  TimeOutInterval: NOT SET"
      info "  macOS default is 30s for login agents — too low for long-running jobs"
      FIXES_NEEDED=$((FIXES_NEEDED + 1))

      if $APPLY; then
        fix "  Setting TimeOutInterval = ${RECOMMENDED}s"
        /usr/libexec/PlistBuddy -c "Add :TimeOutInterval integer ${RECOMMENDED}" "$plist" 2>/dev/null \
          || /usr/libexec/PlistBuddy -c "Set :TimeOutInterval ${RECOMMENDED}" "$plist"
        _reload_agent "$LABEL" "$plist"
        FIXES_APPLIED=$((FIXES_APPLIED + 1))
      else
        info "  → Run with --apply to set TimeOutInterval=${RECOMMENDED}s"
      fi

    elif [[ "$CURRENT_T" -lt 60 ]] 2>/dev/null; then
      err "  TimeOutInterval: ${CURRENT_T}s (CRITICALLY LOW — job will be killed before startup)"
      FIXES_NEEDED=$((FIXES_NEEDED + 1))

      if $APPLY; then
        fix "  Increasing TimeOutInterval: ${CURRENT_T}s → ${RECOMMENDED}s"
        /usr/libexec/PlistBuddy -c "Set :TimeOutInterval ${RECOMMENDED}" "$plist"
        _reload_agent "$LABEL" "$plist"
        FIXES_APPLIED=$((FIXES_APPLIED + 1))
      else
        info "  → Run with --apply to increase to ${RECOMMENDED}s"
      fi

    elif [[ "$CURRENT_T" -lt "$RECOMMENDED" ]] 2>/dev/null; then
      warn "  TimeOutInterval: ${CURRENT_T}s (below recommended ${RECOMMENDED}s)"
      FIXES_NEEDED=$((FIXES_NEEDED + 1))

      if $APPLY; then
        fix "  Increasing TimeOutInterval: ${CURRENT_T}s → ${RECOMMENDED}s"
        /usr/libexec/PlistBuddy -c "Set :TimeOutInterval ${RECOMMENDED}" "$plist"
        _reload_agent "$LABEL" "$plist"
        FIXES_APPLIED=$((FIXES_APPLIED + 1))
      else
        info "  → Run with --apply to increase to ${RECOMMENDED}s"
      fi

    else
      ok "  TimeOutInterval: ${CURRENT_T}s (OK, min: ${RECOMMENDED}s)"
    fi

  done < <(find "$LAUNCH_AGENTS_DIR" -name "*.plist" -print0 2>/dev/null)

  if [[ $MATCHED -eq 0 ]]; then
    info "No matching LaunchAgent plists found in ${LAUNCH_AGENTS_DIR}"
    info "(pattern: ${AGENT_PATTERN})"
  fi
fi
echo ""

# ──────────────────────────────────────────────────────────────────
# 3. WORKSPACE SCRIPT CONFIGS — scan for hardcoded low timeouts
# ──────────────────────────────────────────────────────────────────
echo "── 3. Workspace script timeout values ─────────────"
sep

if [[ -d "$WORKSPACE" ]]; then
  FOUND_ANY=false

  while IFS= read -r -d '' f; do
    # Search for timeout/TIMEOUT assignments with numeric values
    MATCHES=$(grep -nE '(timeout|TIMEOUT|TIME_?OUT)\s*[=:]\s*[0-9]+' "$f" 2>/dev/null || true)
    [[ -z "$MATCHES" ]] && continue

    FOUND_ANY=true
    echo ""
    info "  File: ${f#"$WORKSPACE/"}"

    while IFS= read -r match; do
      LINENO=$(echo "$match" | cut -d: -f1)
      CONTENT=$(echo "$match" | cut -d: -f2-)
      VAL=$(echo "$CONTENT" | grep -oE '[0-9]+' | tail -1)

      if [[ -n "$VAL" ]] && [[ "$VAL" -lt 120 ]] 2>/dev/null; then
        warn "  Line ${LINENO}: ${CONTENT}  ← LOW (${VAL}s)"
        info "  Consider increasing to 300+ for IBKR/backup jobs"
      else
        info "  Line ${LINENO}: ${CONTENT}"
      fi
    done <<< "$MATCHES"
  done < <(find "$WORKSPACE" -maxdepth 3 \
    \( -name "*.py" -o -name "*.sh" -o -name "*.env" -o -name "config.json" -o -name "settings.json" \) \
    -print0 2>/dev/null)

  if ! $FOUND_ANY; then
    info "No hardcoded timeout values found in workspace scripts"
  fi
else
  info "Workspace directory not found: ${WORKSPACE}"
fi
echo ""

# ──────────────────────────────────────────────────────────────────
# 4. REFERENCE CRONTAB TEMPLATE
# ──────────────────────────────────────────────────────────────────
echo "── 4. Reference crontab (safe timeouts) ───────────"
sep
echo ""
cat << 'TEMPLATE'
  # Edit with: crontab -e
  # ─────────────────────────────────────────────────────────────────────────────
  # IBKR Portfolio Refresh — runs up to ~5 min — timeout 600s
  29 21 * * *   timeout 600 python3 ~/.openclaw/workspace/refresh_ibkr_prices.py \
                  >> ~/.openclaw/logs/ibkr.log 2>&1

  # Daily Git Workspace Backup — runs up to ~3 min — timeout 300s
  19 16 * * *   timeout 300 bash ~/.openclaw/workspace/git_backup.sh \
                  >> ~/.openclaw/logs/git_backup.log 2>&1

  # Proactive Scan every 6 hours — timeout 300s
  12 */6 * * *  timeout 300 python3 ~/.openclaw/workspace/proactive_scan.py \
                  >> ~/.openclaw/logs/proactive_scan.log 2>&1

  # Tony outreach slots — timeout 90s each (OpenAI + Telegram, should be <30s)
   0 10 * * *   timeout 90 python3 ~/.openclaw/workspace/proactive_outreach.py --slot morning    >> ~/.openclaw/logs/outreach.log 2>&1
   0 13 * * *   timeout 90 python3 ~/.openclaw/workspace/proactive_outreach.py --slot midday     >> ~/.openclaw/logs/outreach.log 2>&1
  30 16 * * *   timeout 90 python3 ~/.openclaw/workspace/proactive_outreach.py --slot afternoon  >> ~/.openclaw/logs/outreach.log 2>&1
   0 20 * * *   timeout 90 python3 ~/.openclaw/workspace/proactive_outreach.py --slot evening    >> ~/.openclaw/logs/outreach.log 2>&1
  # ─────────────────────────────────────────────────────────────────────────────

TEMPLATE

# ──────────────────────────────────────────────────────────────────
# SUMMARY
# ──────────────────────────────────────────────────────────────────
echo -e "${BLU}══════════════════════════════════════════════════${NC}"
info "Fixes needed:  ${FIXES_NEEDED}"
if $APPLY; then
  info "Fixes applied: ${FIXES_APPLIED}"
  if [[ $FIXES_APPLIED -ge $FIXES_NEEDED ]]; then
    ok "All timeout fixes applied"
  else
    REMAINING=$((FIXES_NEEDED - FIXES_APPLIED))
    warn "${REMAINING} fix(es) could not be applied automatically — review output above"
  fi
else
  if [[ $FIXES_NEEDED -gt 0 ]]; then
    warn "Run with --apply to apply ${FIXES_NEEDED} fix(es)"
    info "  bash scripts/fix-cron-timeouts.sh --apply"
  else
    ok "No timeout issues found — all jobs within limits"
  fi
fi
echo -e "${BLU}══════════════════════════════════════════════════${NC}"
echo ""
