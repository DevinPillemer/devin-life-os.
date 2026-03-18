#!/usr/bin/env python3
"""Generates a fresh GitHub App installation access token. Prints it to stdout."""
import json, time, urllib.request

try:
    import jwt
except ImportError:
    import subprocess, sys
    subprocess.check_call([sys.executable, "-m", "pip", "install", "PyJWT", "cryptography", "-q"])
    import jwt

APP_ID = "3082236"
INSTALLATION_ID = "116083844"
KEY_PATH = "/root/.config/github/app_private_key.pem"

with open(KEY_PATH) as f:
    private_key = f.read()

now = int(time.time())
payload = {"iat": now - 60, "exp": now + 600, "iss": APP_ID}
token = jwt.encode(payload, private_key, algorithm="RS256")

req = urllib.request.Request(
    f"https://api.github.com/app/installations/{INSTALLATION_ID}/access_tokens",
    method="POST",
    data=b"{}"
)
req.add_header("Authorization", f"Bearer {token}")
req.add_header("Accept", "application/vnd.github+json")
req.add_header("Content-Type", "application/json")

resp = urllib.request.urlopen(req, timeout=10)
result = json.loads(resp.read())
print(result["token"])
