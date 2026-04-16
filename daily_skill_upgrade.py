#!/usr/bin/env python3
"""
daily_skill_upgrade.py
Sends one skill upgrade recommendation per day to Tomer's Telegram.
Round-robins across agents: TOMER → TIM → TONY → THEO → repeat.
State is persisted in ~/.openclaw/workspace/memory/upgrades-sent.json
"""

import json
import os
import sys
import urllib.request
import urllib.error
from datetime import datetime, timezone
from pathlib import Path

# ── Paths ──────────────────────────────────────────────────────────────────────
HOME            = Path.home()
OPENCLAW_DIR    = HOME / ".openclaw"
ENV_FILE        = OPENCLAW_DIR / ".env"
MEMORY_DIR      = OPENCLAW_DIR / "workspace" / "memory"
STATE_FILE      = MEMORY_DIR / "upgrades-sent.json"
CRON_LOG_DIR    = OPENCLAW_DIR / "cron" / "runs"

# Ensure directories exist at import time
for d in (MEMORY_DIR, CRON_LOG_DIR):
    d.mkdir(parents=True, exist_ok=True)

# ── Skill Registry ─────────────────────────────────────────────────────────────
SKILLS: list[dict] = [
    # ── TOMER (Claude) ────────────────────────────────────────────────────────
    {
        "name": "mcp-builder",
        "agent": "TOMER",
        "type": "installable",
        "source_url": "https://github.com/anthropics/skills/tree/main/skills/mcp-builder",
        "description": (
            "Guided workflow for building production-grade MCP servers "
            "(FastMCP / TypeScript SDK). Covers tool design, error handling, "
            "auth patterns, and deployment."
        ),
        "why_for_stack": (
            "You're wiring Claude to external APIs. This skill encodes the exact "
            "patterns (tool naming, input validation, idempotency) that prevent "
            "LLM-facing APIs from becoming footguns."
        ),
        "install_command": (
            "cp -r /tmp/anthropic-skills/skills/mcp-builder ~/.claude/skills/"
        ),
        "suggested_schedule": "Use before building any new MCP integration",
    },
    {
        "name": "skill-creator",
        "agent": "TOMER",
        "type": "installable",
        "source_url": "https://github.com/anthropics/skills/tree/main/skills/skill-creator",
        "description": (
            "Create, edit, eval, and benchmark Claude skills. "
            "Includes variance analysis and trigger-accuracy optimisation."
        ),
        "why_for_stack": (
            "Your stack grows new skills regularly. This meta-skill cuts the "
            "iteration loop from hours to minutes with built-in evals."
        ),
        "install_command": (
            "cp -r /tmp/anthropic-skills/skills/skill-creator ~/.claude/skills/"
        ),
        "suggested_schedule": "Weekly skill maintenance pass",
    },
    {
        "name": "gworkspace-mcp",
        "agent": "TOMER",
        "type": "installable",
        "source_url": "https://github.com/modelcontextprotocol/servers/tree/main/src/gdrive",
        "description": (
            "MCP server exposing Google Workspace (Drive, Docs, Sheets, Calendar, Gmail) "
            "as typed tools. Read/write files, query calendars, send mail—all from Claude."
        ),
        "why_for_stack": (
            "Tomer's daily workflow lives in GWorkspace. Connecting Claude here "
            "unlocks automated doc generation, meeting prep, and inbox triage "
            "without copy-pasting."
        ),
        "install_command": (
            "npx -y @modelcontextprotocol/server-gdrive"
        ),
        "suggested_schedule": "Always-on background MCP server",
    },
    {
        "name": "agent-team-orchestration",
        "agent": "TOMER",
        "type": "custom-build",
        "source_url": "https://github.com/obra/superpowers/tree/main/skills/dispatching-parallel-agents",
        "description": (
            "Skill for spinning up, coordinating, and debriefing parallel Claude "
            "sub-agents on independent task partitions. Built on dispatching-parallel-agents."
        ),
        "why_for_stack": (
            "With TOMER, TIM, TONY, and THEO all in play, you need an orchestration "
            "layer that assigns work, collects results, and surfaces conflicts—"
            "this skill provides that playbook."
        ),
        "install_command": (
            "cp -r /tmp/superpowers/skills/dispatching-parallel-agents ~/.claude/skills/ "
            "# then customise for multi-agent naming conventions"
        ),
        "suggested_schedule": "Invoke at the start of any cross-agent project",
    },
    {
        "name": "changelog-generator",
        "agent": "TOMER",
        "type": "custom-build",
        "source_url": "https://github.com/obra/superpowers/tree/main/skills/finishing-a-development-branch",
        "description": (
            "Generates structured changelogs from git history, PR descriptions, "
            "and Asana tasks. Outputs Markdown + JSON suitable for Notion or release notes."
        ),
        "why_for_stack": (
            "Every sprint produces commits across multiple agents. "
            "Automated, consistent changelogs save the 20-minute manual summary "
            "you'd otherwise write before each demo."
        ),
        "install_command": (
            "cp -r /tmp/superpowers/skills/finishing-a-development-branch ~/.claude/skills/ "
            "# extend with Asana + Notion export step"
        ),
        "suggested_schedule": "End of every sprint / before release",
    },

    # ── TIM (OpenClaw) ─────────────────────────────────────────────────────────
    {
        "name": "gog",
        "agent": "TIM",
        "type": "custom-build",
        "source_url": "https://github.com/obra/superpowers/tree/main/skills/using-git-worktrees",
        "description": (
            "Good-Old-Git workflow for OpenClaw: isolated git worktrees per feature, "
            "automatic branch hygiene, and safe-merge verification before any push."
        ),
        "why_for_stack": (
            "OpenClaw runs concurrent agents on the same repo. Without worktree "
            "isolation you get phantom merge conflicts. GoG makes parallel-agent "
            "git usage safe by default."
        ),
        "install_command": (
            "cp -r /tmp/superpowers/skills/using-git-worktrees ~/.claude/skills/ "
            "# alias as 'gog' in settings.json"
        ),
        "suggested_schedule": "Use before any parallel feature branch work",
    },
    {
        "name": "marketing-intel-pipeline",
        "agent": "TIM",
        "type": "custom-build",
        "source_url": "https://github.com/obra/superpowers/tree/main/skills/brainstorming",
        "description": (
            "Automated pipeline: scrape competitor pages → extract positioning signals → "
            "diff against last week → draft talking-points for Tomer. "
            "Runs as a cron-triggered OpenClaw task."
        ),
        "why_for_stack": (
            "Marketing drift is invisible until it's a problem. "
            "This pipeline surfaces weekly competitive changes so you can adjust "
            "messaging proactively instead of reactively."
        ),
        "install_command": (
            "# Custom build: extend brainstorming skill with web-scrape + diff + Telegram output"
        ),
        "suggested_schedule": "Weekly — Monday morning before standups",
    },
    {
        "name": "agent-analytics",
        "agent": "TIM",
        "type": "custom-build",
        "source_url": "https://github.com/obra/superpowers/tree/main/skills/verification-before-completion",
        "description": (
            "Tracks per-agent token spend, task completion rate, error rate, "
            "and latency. Writes to ~/.openclaw/workspace/memory/agent-stats.json "
            "and surfaces weekly Telegram digest."
        ),
        "why_for_stack": (
            "You have four agents burning tokens daily. Without analytics you're "
            "flying blind on cost and quality. This turns every run into a data point."
        ),
        "install_command": (
            "# Custom build: hook into OpenClaw run lifecycle → append metrics JSON"
        ),
        "suggested_schedule": "Always-on — weekly digest every Friday",
    },
    {
        "name": "smart-monitoring",
        "agent": "TIM",
        "type": "custom-build",
        "source_url": "https://github.com/obra/superpowers/tree/main/skills/systematic-debugging",
        "description": (
            "Watches cron logs, agent outputs, and API error rates. "
            "Alerts Tomer via Telegram on anomalies: repeated failures, "
            "cost spikes, or silent task drops."
        ),
        "why_for_stack": (
            "Cron jobs fail silently. This skill is the difference between "
            "discovering a broken pipeline on Monday vs. Friday."
        ),
        "install_command": (
            "# Custom build: wrap systematic-debugging skill with file-watch + threshold alerts"
        ),
        "suggested_schedule": "Always-on daemon",
    },
    {
        "name": "openclaw-self-skill",
        "agent": "TIM",
        "type": "custom-build",
        "source_url": "https://github.com/obra/superpowers/tree/main/skills/writing-skills",
        "description": (
            "OpenClaw writes, tests, and deploys its own skills without human "
            "intervention. Uses writing-skills + skill-creator evals to validate "
            "before installing."
        ),
        "why_for_stack": (
            "This is the compounding flywheel: TIM gets better at its own job "
            "over time. Every workflow gap TIM notices becomes a new skill "
            "next sprint."
        ),
        "install_command": (
            "cp -r /tmp/superpowers/skills/writing-skills ~/.claude/skills/ "
            "# wire into OpenClaw task router as self-improvement job type"
        ),
        "suggested_schedule": "Weekly skill-review sprint task",
    },

    # ── TONY (Hermes) ─────────────────────────────────────────────────────────
    {
        "name": "hermes-self-improving",
        "agent": "TONY",
        "type": "custom-build",
        "source_url": "https://github.com/obra/superpowers/tree/main/skills/writing-skills",
        "description": (
            "Hermes reviews its own conversation transcripts weekly, identifies "
            "recurring failure modes, and proposes system-prompt patches + "
            "new skills to close the gaps."
        ),
        "why_for_stack": (
            "TONY is your personal communications layer. Self-improvement "
            "means fewer repeated mistakes on email tone, calendar conflicts, "
            "and scheduling edge cases."
        ),
        "install_command": (
            "# Custom build: transcript analyser → failure classifier → skill PR generator"
        ),
        "suggested_schedule": "Weekly — Sunday night",
    },
    {
        "name": "honcho-memory",
        "agent": "TONY",
        "type": "installable",
        "source_url": "https://github.com/plastic-labs/honcho",
        "description": (
            "Persistent, user-scoped memory layer for LLM agents. "
            "Stores facts, preferences, and conversation summaries with "
            "semantic retrieval. Python SDK + REST API."
        ),
        "why_for_stack": (
            "TONY talks to you every day. Without memory it forgets your "
            "communication style, standing preferences, and past decisions. "
            "Honcho gives Hermes the context to feel like a colleague, not a stranger."
        ),
        "install_command": (
            "pip install honcho-ai && honcho init --project hermes-tony"
        ),
        "suggested_schedule": "Always-on — query at session start, write at session end",
    },
    {
        "name": "hermes-calendar-email",
        "agent": "TONY",
        "type": "custom-build",
        "source_url": "https://github.com/modelcontextprotocol/servers/tree/main/src/google-calendar",
        "description": (
            "Hermes-native skill combining GCal + Gmail MCP tools into a single "
            "workflow: reads upcoming meetings, drafts prep notes, flags urgent "
            "emails, and proposes schedule changes."
        ),
        "why_for_stack": (
            "TONY's core job is your time and inbox. This skill packages "
            "the two highest-leverage tools into one coherent daily-briefing workflow."
        ),
        "install_command": (
            "# Compose gworkspace-mcp with a Hermes-specific system prompt skill"
        ),
        "suggested_schedule": "Daily — 7:45 AM before daily_skill_upgrade runs",
    },
    {
        "name": "voice-talk-mode",
        "agent": "TONY",
        "type": "custom-build",
        "source_url": "https://github.com/anthropics/anthropic-sdk-python",
        "description": (
            "Turns Hermes into a voice assistant: STT (Whisper) → Claude → "
            "TTS (ElevenLabs). Triggered by hotword or Telegram voice message. "
            "Streams responses back as audio."
        ),
        "why_for_stack": (
            "Async text is slow for quick decisions. Voice mode lets you "
            "brief TONY hands-free while commuting or between meetings."
        ),
        "install_command": (
            "pip install openai-whisper elevenlabs anthropic "
            "# wire Telegram voice handler → Whisper → Claude → ElevenLabs"
        ),
        "suggested_schedule": "On-demand hotword / Telegram voice message trigger",
    },

    # ── THEO (Claude Managed) ─────────────────────────────────────────────────
    {
        "name": "mcp-builder",
        "agent": "THEO",
        "type": "installable",
        "source_url": "https://github.com/anthropics/skills/tree/main/skills/mcp-builder",
        "description": (
            "Same mcp-builder skill, used by THEO for building project-specific "
            "MCP integrations (staging APIs, internal tooling) within managed sessions."
        ),
        "why_for_stack": (
            "THEO handles client-facing build work. Having mcp-builder "
            "installed means THEO can scaffold integrations to client APIs "
            "without you writing boilerplate."
        ),
        "install_command": (
            "cp -r /tmp/anthropic-skills/skills/mcp-builder ~/.claude/skills/"
        ),
        "suggested_schedule": "Invoke at project kickoff when new integrations are scoped",
    },
    {
        "name": "webapp-testing",
        "agent": "THEO",
        "type": "installable",
        "source_url": "https://github.com/anthropics/skills/tree/main/skills/webapp-testing",
        "description": (
            "Playwright-based skill: launches dev server, navigates UI, captures "
            "screenshots, reads console logs, and verifies golden-path flows "
            "before marking any feature done."
        ),
        "why_for_stack": (
            "THEO ships frontend code. Without automated browser verification "
            "every deployment is a prayer. This skill makes 'it works' mean "
            "something provable."
        ),
        "install_command": (
            "cp -r /tmp/anthropic-skills/skills/webapp-testing ~/.claude/skills/ "
            "&& pip install playwright && playwright install chromium"
        ),
        "suggested_schedule": "Run before every PR creation",
    },
    {
        "name": "frontend-design",
        "agent": "THEO",
        "type": "installable",
        "source_url": "https://github.com/anthropics/skills/tree/main/skills/frontend-design",
        "description": (
            "Production-grade UI generation: distinctive components, polished "
            "layouts, avoids generic AI aesthetics. Outputs React / HTML+CSS "
            "with thoughtful design decisions baked in."
        ),
        "why_for_stack": (
            "THEO builds the user-facing layer. frontend-design skill pushes "
            "output quality from 'functional' to 'shippable' without a separate "
            "design review pass."
        ),
        "install_command": (
            "cp -r /tmp/anthropic-skills/skills/frontend-design ~/.claude/skills/"
        ),
        "suggested_schedule": "Invoke at the start of any UI feature task",
    },
    {
        "name": "tdd",
        "agent": "THEO",
        "type": "installable",
        "source_url": "https://github.com/obra/superpowers/tree/main/skills/test-driven-development",
        "description": (
            "Test-first development workflow: red → green → refactor cycle enforced "
            "by the skill. Writes failing tests before any implementation code, "
            "then drives implementation to pass them."
        ),
        "why_for_stack": (
            "THEO's managed sessions don't have a human watching every line. "
            "TDD is the safety net that catches regressions before they reach "
            "your review queue."
        ),
        "install_command": (
            "cp -r /tmp/superpowers/skills/test-driven-development ~/.claude/skills/"
        ),
        "suggested_schedule": "Default for all THEO feature and bugfix tasks",
    },
    {
        "name": "security-audit",
        "agent": "THEO",
        "type": "installable",
        "source_url": "https://github.com/obra/superpowers/tree/main/skills/verification-before-completion",  # base
        "description": (
            "Pre-merge security review: scans for OWASP Top 10, checks dependency "
            "CVEs, verifies auth boundaries, flags secrets in code. "
            "Extends security-review skill with automated tooling."
        ),
        "why_for_stack": (
            "Client-facing code has real attack surface. Running a security audit "
            "skill before every merge costs 2 minutes and prevents the "
            "incidents that cost weeks."
        ),
        "install_command": (
            "# Uses built-in security-review skill; extend with: "
            "pip install bandit safety semgrep"
        ),
        "suggested_schedule": "Run before every PR to main/production branches",
    },
]

# Agent order for round-robin
AGENT_ORDER = ["TOMER", "TIM", "TONY", "THEO"]


# ── Environment ────────────────────────────────────────────────────────────────

def load_env(env_path: Path) -> dict[str, str]:
    """Parse a simple KEY=VALUE .env file. Raises if file missing."""
    if not env_path.exists():
        raise FileNotFoundError(
            f".env file not found at {env_path}. "
            "Create it with TOMER_TELEGRAM_TOKEN and TOMER_CHAT_ID."
        )
    env: dict[str, str] = {}
    for line in env_path.read_text().splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, _, value = line.partition("=")
        env[key.strip()] = value.strip().strip('"').strip("'")
    return env


# ── State persistence ──────────────────────────────────────────────────────────

def load_state() -> dict:
    if STATE_FILE.exists():
        try:
            return json.loads(STATE_FILE.read_text())
        except (json.JSONDecodeError, OSError):
            pass
    # Initial state
    return {
        "agent_index": 0,
        "skill_indices": {agent: 0 for agent in AGENT_ORDER},
        "history": [],
    }


def save_state(state: dict) -> None:
    STATE_FILE.write_text(json.dumps(state, indent=2))


# ── Round-robin selection ──────────────────────────────────────────────────────

def pick_next_skill(state: dict) -> tuple[dict, dict]:
    """
    Returns (skill, updated_state).
    Advances round-robin: current agent → next skill for that agent.
    Wraps both per-agent skill index and global agent index.
    """
    agent_idx = state["agent_index"] % len(AGENT_ORDER)
    agent_name = AGENT_ORDER[agent_idx]

    agent_skills = [s for s in SKILLS if s["agent"] == agent_name]
    if not agent_skills:
        raise RuntimeError(f"No skills found for agent {agent_name}")

    skill_idx = state["skill_indices"].get(agent_name, 0) % len(agent_skills)
    skill = agent_skills[skill_idx]

    new_state = dict(state)
    new_state["skill_indices"] = dict(state["skill_indices"])
    new_state["skill_indices"][agent_name] = (skill_idx + 1) % len(agent_skills)
    new_state["agent_index"] = (agent_idx + 1) % len(AGENT_ORDER)

    return skill, new_state


# ── Message formatting ─────────────────────────────────────────────────────────

TYPE_EMOJI = {
    "installable":  "📦",
    "built-in":     "⚙️",
    "custom-build": "🔨",
}

AGENT_EMOJI = {
    "TOMER": "🧠",
    "TIM":   "🐾",
    "TONY":  "✉️",
    "THEO":  "🏗️",
}


def format_message(skill: dict) -> str:
    type_label = skill["type"].upper()
    type_icon  = TYPE_EMOJI.get(skill["type"], "🔧")
    agent_icon = AGENT_EMOJI.get(skill["agent"], "🤖")
    today      = datetime.now().strftime("%A %d %b %Y")

    lines = [
        f"🛠️ *Daily Skill Upgrade* — {today}",
        "",
        f"*{skill['name']}*",
        "",
        f"{type_icon} *TYPE:* `{type_label}`",
        f"🔗 *SOURCE:* {skill['source_url']}",
        f"{agent_icon} *AGENT:* {skill['agent']}",
        "",
        f"📋 *WHAT IT DOES*",
        skill["description"],
        "",
        f"🎯 *FITS YOUR STACK*",
        skill["why_for_stack"],
        "",
        f"⚡ *INSTALL*",
        f"`{skill['install_command']}`",
        "",
        f"🗓️ *WHEN TO USE:* {skill['suggested_schedule']}",
    ]
    return "\n".join(lines)


# ── Telegram ───────────────────────────────────────────────────────────────────

def send_telegram(token: str, chat_id: str, text: str) -> dict:
    url     = f"https://api.telegram.org/bot{token}/sendMessage"
    payload = json.dumps({
        "chat_id":    chat_id,
        "text":       text,
        "parse_mode": "Markdown",
        "disable_web_page_preview": True,
    }).encode()

    req = urllib.request.Request(
        url,
        data=payload,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            return json.loads(resp.read())
    except urllib.error.HTTPError as exc:
        body = exc.read().decode(errors="replace")
        raise RuntimeError(f"Telegram HTTP {exc.code}: {body}") from exc
    except urllib.error.URLError as exc:
        raise RuntimeError(f"Telegram network error: {exc.reason}") from exc


# ── History logging ────────────────────────────────────────────────────────────

def record_sent(state: dict, skill: dict, tg_response: dict) -> dict:
    entry = {
        "sent_at":        datetime.now(timezone.utc).isoformat(),
        "skill_name":     skill["name"],
        "agent":          skill["agent"],
        "type":           skill["type"],
        "source_url":     skill["source_url"],
        "telegram_msg_id": tg_response.get("result", {}).get("message_id"),
    }
    new_state = dict(state)
    new_state["history"] = state.get("history", []) + [entry]
    return new_state


# ── Main ───────────────────────────────────────────────────────────────────────

def main() -> int:
    print(f"[{datetime.now().isoformat()}] daily_skill_upgrade starting")

    # Load credentials
    try:
        env = load_env(ENV_FILE)
    except FileNotFoundError as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        return 1

    token   = env.get("TOMER_TELEGRAM_TOKEN", "")
    chat_id = env.get("TOMER_CHAT_ID", "")
    if not token or not chat_id:
        print(
            "ERROR: TOMER_TELEGRAM_TOKEN and TOMER_CHAT_ID must be set in "
            f"{ENV_FILE}",
            file=sys.stderr,
        )
        return 1

    # Load state and pick skill
    state = load_state()
    skill, next_state = pick_next_skill(state)
    print(f"Selected skill: {skill['name']} for agent {skill['agent']}")

    # Format and send
    message = format_message(skill)
    try:
        tg_resp = send_telegram(token, chat_id, message)
    except RuntimeError as exc:
        print(f"ERROR sending Telegram message: {exc}", file=sys.stderr)
        return 1

    if not tg_resp.get("ok"):
        print(f"ERROR: Telegram returned not-ok: {tg_resp}", file=sys.stderr)
        return 1

    msg_id = tg_resp.get("result", {}).get("message_id", "?")
    print(f"Sent successfully — Telegram message_id={msg_id}")

    # Persist updated state + history
    final_state = record_sent(next_state, skill, tg_resp)
    save_state(final_state)
    print(f"State saved to {STATE_FILE}")

    return 0


if __name__ == "__main__":
    sys.exit(main())
