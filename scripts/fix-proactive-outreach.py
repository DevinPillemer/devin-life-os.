#!/usr/bin/env python3
"""
fix-proactive-outreach.py
Patched proactive outreach runner — fixes OpenAI key path error from original.

Usage:
  python3 scripts/fix-proactive-outreach.py --slot morning
  python3 scripts/fix-proactive-outreach.py --slot midday
  python3 scripts/fix-proactive-outreach.py --slot afternoon
  python3 scripts/fix-proactive-outreach.py --slot evening
  python3 scripts/fix-proactive-outreach.py --slot morning --dry-run
  python3 scripts/fix-proactive-outreach.py --slot morning --env-file /path/to/.env

Slots and their scheduled times:
  morning   → 10:00
  midday    → 13:00
  afternoon → 16:30
  evening   → 20:00

Deploy: copy or symlink to ~/.openclaw/workspace/proactive_outreach.py
"""

from __future__ import annotations

import argparse
import json
import os
import sys
import time
import urllib.error
import urllib.request
from datetime import datetime
from pathlib import Path

# ── Paths ───────────────────────────────────────────────────────────
OPENCLAW_DIR = Path.home() / ".openclaw"
ENV_FILE     = OPENCLAW_DIR / ".env"
WORKSPACE    = OPENCLAW_DIR / "workspace"
LOG_FILE     = WORKSPACE / "memory" / "proactive_outreach_log.json"

# ── Slot definitions ────────────────────────────────────────────────
SLOTS: dict[str, dict] = {
    "morning":   {"label": "Morning",   "hour": 10, "minute": 0},
    "midday":    {"label": "Midday",    "hour": 13, "minute": 0},
    "afternoon": {"label": "Afternoon", "hour": 16, "minute": 30},
    "evening":   {"label": "Evening",   "hour": 20, "minute": 0},
}

# ── OpenAI ──────────────────────────────────────────────────────────
OPENAI_URL   = "https://api.openai.com/v1/chat/completions"
OPENAI_MODEL = "gpt-4o"

# ── Logging helpers ─────────────────────────────────────────────────
def _ts() -> str:
    return datetime.now().strftime("%Y-%m-%d %H:%M:%S")

def log_info(msg: str)  -> None: print(f"[{_ts()}] [INFO]  {msg}")
def log_ok(msg: str)    -> None: print(f"[{_ts()}] [OK]    {msg}")
def log_warn(msg: str)  -> None: print(f"[{_ts()}] [WARN]  {msg}", file=sys.stderr)
def log_err(msg: str)   -> None: print(f"[{_ts()}] [ERROR] {msg}", file=sys.stderr)


# ── .env loader ─────────────────────────────────────────────────────
def load_env_file(env_path: Path) -> dict[str, str]:
    """
    Parse a .env file and return a dict of key→value pairs.
    Handles: quoted values, inline comments, blank lines, comment lines.
    Does NOT touch os.environ — callers decide what to export.
    """
    result: dict[str, str] = {}
    if not env_path.is_file():
        return result

    with env_path.open(encoding="utf-8") as fh:
        for raw_line in fh:
            line = raw_line.strip()
            # Skip blank lines and full-line comments
            if not line or line.startswith("#"):
                continue
            if "=" not in line:
                continue

            key, _, raw_val = line.partition("=")
            key = key.strip()
            raw_val = raw_val.strip()

            # Strip surrounding single or double quotes
            if len(raw_val) >= 2 and raw_val[0] == raw_val[-1] and raw_val[0] in ('"', "'"):
                raw_val = raw_val[1:-1]
            else:
                # Strip inline comment (unquoted values only)
                raw_val = raw_val.split(" #")[0].split("\t#")[0].rstrip()

            result[key] = raw_val

    return result


def resolve_openai_key(env_file_vars: dict[str, str]) -> str:
    """
    Resolve the OpenAI API key with clear priority order:
      1. OPENAI_API_KEY already in the process environment (e.g. set by launchd/cron)
      2. OPENAI_API_KEY from the .env file
      3. Legacy key names (OPENAI_KEY, OPENAI_SECRET, OPENAI_TOKEN) from .env
    Raises RuntimeError with an actionable message if not found.
    """
    # 1. Process environment takes precedence (set by cron/launchd ExportVars)
    key = os.environ.get("OPENAI_API_KEY", "").strip()
    if key:
        return key

    # 2. Primary name in .env
    key = env_file_vars.get("OPENAI_API_KEY", "").strip()
    if key:
        return key

    # 3. Legacy names that earlier configs used incorrectly
    legacy_names = ("OPENAI_KEY", "OPENAI_SECRET", "OPENAI_TOKEN", "OPEN_AI_KEY")
    for name in legacy_names:
        key = env_file_vars.get(name, "").strip()
        if key:
            log_warn(
                f"Using legacy key name '{name}' — add this line to {ENV_FILE}:\n"
                f"  OPENAI_API_KEY={key[:8]}..."
            )
            return key

    raise RuntimeError(
        "OPENAI_API_KEY not found.\n"
        f"  Checked: process environment, {ENV_FILE}\n"
        f"  Fix: add the following line to {ENV_FILE}:\n"
        f"    OPENAI_API_KEY=sk-..."
    )


def resolve_telegram_config(env_vars: dict[str, str], slot: str) -> tuple[str, str]:
    """
    Return (bot_token, chat_id) for the given slot.
    Lookup order: slot-specific → shared outreach → tony-specific → generic.
    """
    s = slot.upper()

    token = (
        env_vars.get(f"TELEGRAM_BOT_TOKEN_{s}")
        or env_vars.get("TELEGRAM_BOT_TOKEN_OUTREACH")
        or env_vars.get("TELEGRAM_BOT_TOKEN_TONY")
        or env_vars.get("TELEGRAM_BOT_TOKEN")
        or os.environ.get(f"TELEGRAM_BOT_TOKEN_{s}")
        or os.environ.get("TELEGRAM_BOT_TOKEN")
        or ""
    ).strip()

    chat_id = (
        env_vars.get(f"TELEGRAM_CHAT_ID_{s}")
        or env_vars.get("TELEGRAM_CHAT_ID_OUTREACH")
        or env_vars.get("TELEGRAM_CHAT_ID_TONY")
        or env_vars.get("TELEGRAM_CHAT_ID")
        or os.environ.get(f"TELEGRAM_CHAT_ID_{s}")
        or os.environ.get("TELEGRAM_CHAT_ID")
        or ""
    ).strip()

    return token, chat_id


# ── HTTP helpers ────────────────────────────────────────────────────
def _http_post(
    url: str,
    payload: dict,
    headers: dict[str, str],
    timeout: int = 30,
    retries: int = 3,
    retry_statuses: tuple[int, ...] = (429, 500, 502, 503, 504),
) -> dict:
    """POST JSON payload, return parsed response dict. Raises RuntimeError on failure."""
    data = json.dumps(payload).encode()

    for attempt in range(retries):
        req = urllib.request.Request(url, data=data, headers=headers, method="POST")
        try:
            with urllib.request.urlopen(req, timeout=timeout) as resp:
                return json.loads(resp.read())
        except urllib.error.HTTPError as exc:
            body = exc.read().decode(errors="replace")
            if exc.code in (400, 401, 403):
                # Non-retryable auth/client errors
                raise RuntimeError(f"HTTP {exc.code}: {body}") from exc
            if exc.code in retry_statuses and attempt < retries - 1:
                wait = 2 ** attempt
                log_warn(f"HTTP {exc.code} — retrying in {wait}s (attempt {attempt + 1}/{retries})")
                time.sleep(wait)
                continue
            raise RuntimeError(f"HTTP {exc.code} after {attempt + 1} attempt(s): {body}") from exc
        except urllib.error.URLError as exc:
            if attempt == retries - 1:
                raise RuntimeError(
                    f"Network error after {retries} attempt(s): {exc.reason}"
                ) from exc
            wait = 2 ** attempt
            log_warn(f"Network error — retrying in {wait}s: {exc.reason}")
            time.sleep(wait)

    raise RuntimeError(f"Request exhausted {retries} retries")  # pragma: no cover


# ── OpenAI generation ────────────────────────────────────────────────
def generate_outreach_message(api_key: str, slot: str, slot_label: str) -> str:
    """Call OpenAI to generate a contextual outreach message for Tony."""
    today = datetime.now().strftime("%A, %B %-d, %Y")

    system_prompt = (
        "You are Tony's personal outreach assistant. Tony is a driven professional "
        "who values authentic relationships. You help him stay proactively connected "
        "without being spammy. Messages should feel like they come from Tony directly."
    )

    user_prompt = (
        f"Today is {today}. Generate a {slot_label.lower()} outreach message Tony can send "
        f"to one of his contacts to maintain a genuine connection.\n\n"
        f"Requirements:\n"
        f"- 2–4 sentences, warm and specific\n"
        f"- One clear call to action (follow-up, share something useful, quick call, etc.)\n"
        f"- No hashtags, no hollow filler phrases ('hope this finds you well')\n"
        f"- Plain text only — no markdown, no bullet points\n"
        f"- Vary tone based on slot: "
        f"morning=energetic, midday=practical, afternoon=collaborative, evening=reflective"
    )

    log_info(f"Calling OpenAI ({OPENAI_MODEL}) for {slot_label} message...")

    response = _http_post(
        OPENAI_URL,
        payload={
            "model": OPENAI_MODEL,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user",   "content": user_prompt},
            ],
            "max_tokens": 250,
            "temperature": 0.75,
        },
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {api_key}",
        },
        timeout=30,
        retries=3,
    )

    try:
        content = response["choices"][0]["message"]["content"].strip()
    except (KeyError, IndexError) as exc:
        raise RuntimeError(f"Unexpected OpenAI response shape: {response}") from exc

    if not content:
        raise RuntimeError("OpenAI returned an empty message")

    return content


# ── Telegram send ───────────────────────────────────────────────────
def send_telegram_message(token: str, chat_id: str, text: str) -> None:
    """Send a message via Telegram Bot API. Raises RuntimeError on failure."""
    url = f"https://api.telegram.org/bot{token}/sendMessage"

    response = _http_post(
        url,
        payload={
            "chat_id": chat_id,
            "text": text,
            "parse_mode": "HTML",
            "disable_web_page_preview": True,
        },
        headers={"Content-Type": "application/json"},
        timeout=15,
        retries=3,
    )

    if not response.get("ok"):
        raise RuntimeError(
            f"Telegram rejected message: {response.get('description', 'unknown error')}"
        )


# ── Run log ─────────────────────────────────────────────────────────
def append_to_log(
    slot: str,
    success: bool,
    message_preview: str = "",
    error: str = "",
) -> None:
    """Append a JSON record to the outreach run log (keeps last 500 entries)."""
    LOG_FILE.parent.mkdir(parents=True, exist_ok=True)

    existing: list[dict] = []
    if LOG_FILE.is_file():
        try:
            existing = json.loads(LOG_FILE.read_text(encoding="utf-8"))
            if not isinstance(existing, list):
                existing = []
        except (json.JSONDecodeError, OSError):
            existing = []

    existing.append({
        "ts":              datetime.now().isoformat(timespec="seconds"),
        "slot":            slot,
        "success":         success,
        "message_preview": message_preview[:200] if message_preview else "",
        "error":           error[:500] if error else "",
    })

    # Trim to last 500 entries
    if len(existing) > 500:
        existing = existing[-500:]

    try:
        LOG_FILE.write_text(json.dumps(existing, indent=2, ensure_ascii=False), encoding="utf-8")
    except OSError as exc:
        log_warn(f"Could not write run log ({LOG_FILE}): {exc}")


# ── Entry point ──────────────────────────────────────────────────────
def parse_args() -> argparse.Namespace:
    p = argparse.ArgumentParser(
        description="Proactive outreach runner for Tony (fixed OpenAI key path)",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=(
            "Examples:\n"
            "  python3 fix-proactive-outreach.py --slot morning\n"
            "  python3 fix-proactive-outreach.py --slot evening --dry-run\n"
            "  python3 fix-proactive-outreach.py --slot midday --env-file ~/secrets/.env\n"
        ),
    )
    p.add_argument(
        "--slot",
        choices=list(SLOTS.keys()),
        required=True,
        metavar="SLOT",
        help="Outreach slot: morning (10:00) | midday (13:00) | afternoon (16:30) | evening (20:00)",
    )
    p.add_argument(
        "--dry-run",
        action="store_true",
        help="Generate message but do NOT send to Telegram",
    )
    p.add_argument(
        "--env-file",
        type=Path,
        default=ENV_FILE,
        metavar="PATH",
        help=f"Path to .env file  (default: {ENV_FILE})",
    )
    p.add_argument(
        "--model",
        default=OPENAI_MODEL,
        help=f"OpenAI model override  (default: {OPENAI_MODEL})",
    )
    return p.parse_args()


def main() -> int:
    args = parse_args()
    slot       = args.slot
    slot_meta  = SLOTS[slot]
    slot_label = slot_meta["label"]

    log_info(f"=== Proactive Outreach — {slot_label} slot ===")

    # Override model if requested
    global OPENAI_MODEL
    OPENAI_MODEL = args.model

    # Load .env
    env_vars = load_env_file(args.env_file)
    if not env_vars and not os.environ.get("OPENAI_API_KEY"):
        log_warn(f".env file empty or not found at {args.env_file}")

    # ── Resolve OpenAI key ───────────────────────────────────────────
    try:
        api_key = resolve_openai_key(env_vars)
        log_info(f"OpenAI key resolved (prefix: {api_key[:8]}...)")
    except RuntimeError as exc:
        log_err(str(exc))
        append_to_log(slot, success=False, error=str(exc))
        return 1

    # ── Generate message ─────────────────────────────────────────────
    try:
        message = generate_outreach_message(api_key, slot, slot_label)
    except RuntimeError as exc:
        log_err(f"OpenAI generation failed: {exc}")
        append_to_log(slot, success=False, error=str(exc))
        return 1

    preview = message[:120] + ("..." if len(message) > 120 else "")
    log_ok(f"Message generated ({len(message)} chars): {preview}")

    # ── Dry-run short-circuit ─────────────────────────────────────────
    if args.dry_run:
        log_info("--dry-run: skipping Telegram send")
        print("\n── Generated message ──────────────────────────────────")
        print(message)
        print("───────────────────────────────────────────────────────\n")
        append_to_log(slot, success=True, message_preview=message)
        return 0

    # ── Resolve Telegram credentials ──────────────────────────────────
    token, chat_id = resolve_telegram_config(env_vars, slot)

    if not token or not chat_id:
        missing = []
        if not token:   missing.append(f"TELEGRAM_BOT_TOKEN_{slot.upper()} (or TELEGRAM_BOT_TOKEN_OUTREACH)")
        if not chat_id: missing.append(f"TELEGRAM_CHAT_ID_{slot.upper()} (or TELEGRAM_CHAT_ID_OUTREACH)")
        msg = (
            f"Missing Telegram credentials for slot '{slot}'.\n"
            f"  Add to {args.env_file}:\n"
            + "".join(f"    {v}\n" for v in missing)
        )
        log_err(msg)
        append_to_log(slot, success=False, error=msg)
        return 1

    # ── Send ──────────────────────────────────────────────────────────
    log_info(f"Sending to Telegram chat_id={chat_id}...")
    try:
        send_telegram_message(token, chat_id, message)
        log_ok("Message sent successfully")
        append_to_log(slot, success=True, message_preview=message)
        return 0
    except RuntimeError as exc:
        log_err(f"Telegram send failed: {exc}")
        append_to_log(slot, success=False, error=str(exc))
        return 1


if __name__ == "__main__":
    sys.exit(main())
