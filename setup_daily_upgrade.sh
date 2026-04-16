#!/usr/bin/env bash
# setup_daily_upgrade.sh
# Sets up daily_skill_upgrade.py on a local Mac (or Linux).
# Run from the repo root: bash setup_daily_upgrade.sh
set -euo pipefail

# ── Config ────────────────────────────────────────────────────────────────────
CHAT_ID="8650482603"
OPENCLAW_DIR="$HOME/.openclaw"
ENV_FILE="$OPENCLAW_DIR/.env"
WORKSPACE="$OPENCLAW_DIR/workspace"
MEMORY="$OPENCLAW_DIR/workspace/memory"
CRON_LOGS="$OPENCLAW_DIR/cron/runs"
SKILLS_DIR="$HOME/.claude/skills"
SCRIPT_NAME="daily_skill_upgrade.py"
# Resolve script location so this works regardless of cwd
REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

ok()   { echo -e "${GREEN}✓${NC} $*"; }
warn() { echo -e "${YELLOW}⚠${NC}  $*"; }
die()  { echo -e "${RED}✗${NC}  $*" >&2; exit 1; }

echo ""
echo "╔══════════════════════════════════════════════╗"
echo "║      daily_skill_upgrade  —  setup script    ║"
echo "╚══════════════════════════════════════════════╝"
echo ""

# ── Step 1: Telegram credentials ─────────────────────────────────────────────
echo "── Step 1: Telegram credentials"

mkdir -p "$OPENCLAW_DIR"

# Read existing values if present
EXISTING_TOKEN=""
EXISTING_CHAT=""
if [[ -f "$ENV_FILE" ]]; then
    EXISTING_TOKEN=$(grep -E '^TOMER_TELEGRAM_TOKEN=' "$ENV_FILE" | cut -d= -f2- | tr -d '"' | tr -d "'" || true)
    EXISTING_CHAT=$(grep -E '^TOMER_CHAT_ID=' "$ENV_FILE" | cut -d= -f2- | tr -d '"' | tr -d "'" || true)
fi

# Determine token to use
if [[ -n "$EXISTING_TOKEN" ]]; then
    TOKEN="$EXISTING_TOKEN"
    ok "TOMER_TELEGRAM_TOKEN already in $ENV_FILE — keeping it"
else
    echo ""
    echo "  The Telegram bot token for @devin_claude_code_bot is required."
    echo "  Get it from BotFather: https://t.me/botfather → /mybots → API Token"
    echo ""
    read -rp "  Paste TOMER_TELEGRAM_TOKEN: " TOKEN
    [[ -z "$TOKEN" ]] && die "Token cannot be empty."
fi

# Determine chat ID to use
if [[ -n "$EXISTING_CHAT" ]]; then
    CHAT="$EXISTING_CHAT"
    ok "TOMER_CHAT_ID already in $ENV_FILE — keeping it ($CHAT)"
else
    CHAT="$CHAT_ID"
fi

# Write / update .env (preserve any other keys already in the file)
TMP_ENV=$(mktemp)
if [[ -f "$ENV_FILE" ]]; then
    grep -Ev '^TOMER_TELEGRAM_TOKEN=|^TOMER_CHAT_ID=' "$ENV_FILE" > "$TMP_ENV" || true
fi
{
    cat "$TMP_ENV"
    echo "TOMER_TELEGRAM_TOKEN=$TOKEN"
    echo "TOMER_CHAT_ID=$CHAT"
} > "$ENV_FILE"
rm "$TMP_ENV"
chmod 600 "$ENV_FILE"
ok "$ENV_FILE written (chmod 600)"

# ── Step 2: Directories ───────────────────────────────────────────────────────
echo ""
echo "── Step 2: Directories"
mkdir -p "$WORKSPACE" "$MEMORY" "$CRON_LOGS" "$SKILLS_DIR"
ok "Created: $WORKSPACE, $MEMORY, $CRON_LOGS, $SKILLS_DIR"

# ── Step 3: Copy script ───────────────────────────────────────────────────────
echo ""
echo "── Step 3: Install $SCRIPT_NAME"
SCRIPT_SRC="$REPO_DIR/$SCRIPT_NAME"
[[ -f "$SCRIPT_SRC" ]] || die "$SCRIPT_SRC not found. Run this from the repo root."
cp "$SCRIPT_SRC" "$WORKSPACE/$SCRIPT_NAME"
chmod +x "$WORKSPACE/$SCRIPT_NAME"
ok "Copied to $WORKSPACE/$SCRIPT_NAME"

# ── Step 4: Install Claude skills ─────────────────────────────────────────────
echo ""
echo "── Step 4: Install Claude skills"

# anthropics/skills
if [[ -d /tmp/anthropic-skills/.git ]]; then
    echo "  Updating anthropics/skills..."
    git -C /tmp/anthropic-skills pull --quiet
else
    echo "  Cloning anthropics/skills..."
    git clone --quiet https://github.com/anthropics/skills /tmp/anthropic-skills
fi
for s in mcp-builder skill-creator frontend-design webapp-testing; do
    if [[ -d "/tmp/anthropic-skills/skills/$s" ]]; then
        cp -r "/tmp/anthropic-skills/skills/$s" "$SKILLS_DIR/"
        ok "  skill: $s"
    else
        warn "  skill not found in repo: $s (skipping)"
    fi
done

# obra/superpowers
if [[ -d /tmp/superpowers/.git ]]; then
    echo "  Updating obra/superpowers..."
    git -C /tmp/superpowers pull --quiet
else
    echo "  Cloning obra/superpowers..."
    git clone --quiet https://github.com/obra/superpowers /tmp/superpowers
fi
if [[ -d /tmp/superpowers/skills ]]; then
    cp -r /tmp/superpowers/skills/* "$SKILLS_DIR/"
    ok "  superpowers skills copied"
else
    warn "  /tmp/superpowers/skills not found — skipping"
fi

SKILL_COUNT=$(ls "$SKILLS_DIR" | wc -l | tr -d ' ')
ok "$SKILL_COUNT skills total in $SKILLS_DIR"

# ── Step 5: Crontab ───────────────────────────────────────────────────────────
echo ""
echo "── Step 5: Crontab"
CRON_ENTRY='55 8 * * * cd ~/.openclaw/workspace && python3 daily_skill_upgrade.py >> ~/.openclaw/cron/runs/daily_skill_upgrade_$(date +\%Y-\%m-\%d).log 2>&1'

if crontab -l 2>/dev/null | grep -q 'daily_skill_upgrade'; then
    ok "Cron entry already present — skipping"
else
    (crontab -l 2>/dev/null; echo "$CRON_ENTRY") | crontab -
    ok "Cron entry added: 55 8 * * *"
fi

# ── Step 6: Verify ────────────────────────────────────────────────────────────
echo ""
echo "── Step 6: Verify"

# Python syntax
python3 -c "
import ast, os
path = os.path.expanduser('~/.openclaw/workspace/daily_skill_upgrade.py')
ast.parse(open(path).read())
print('syntax OK')
" && ok "Script parses as valid Python"

# Env vars present
TOKEN_CHECK=$(grep -c 'TOMER_TELEGRAM_TOKEN' "$ENV_FILE" || true)
CHAT_CHECK=$(grep -c 'TOMER_CHAT_ID' "$ENV_FILE" || true)
[[ "$TOKEN_CHECK" -ge 1 ]] && ok "TOMER_TELEGRAM_TOKEN present in .env"
[[ "$CHAT_CHECK"  -ge 1 ]] && ok "TOMER_CHAT_ID present in .env"

# Crontab confirmation
crontab -l 2>/dev/null | grep -q 'daily_skill_upgrade' && ok "Cron entry confirmed in crontab"

# Skills spot-check
[[ -d "$SKILLS_DIR/mcp-builder" ]]  && ok "Skill mcp-builder present"
[[ -d "$SKILLS_DIR/webapp-testing" ]] && ok "Skill webapp-testing present"

echo ""
echo "╔══════════════════════════════════════════════╗"
echo "║              Setup complete!                 ║"
echo "╚══════════════════════════════════════════════╝"
echo ""
echo "  Script:  $WORKSPACE/$SCRIPT_NAME"
echo "  Env:     $ENV_FILE"
echo "  Skills:  $SKILLS_DIR  ($SKILL_COUNT installed)"
echo "  Cron:    daily at 08:55"
echo ""
echo "  Test run:"
echo "    python3 $WORKSPACE/$SCRIPT_NAME"
echo ""
