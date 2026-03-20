#!/usr/bin/env python3
"""
Snapshot module content from Supabase to a local JSON file.
Run before making content changes to create a rollback point.
Output: content-snapshots/modules-YYYY-MM-DD-HHMMSS.json
"""

import json
import os
import urllib.request
from datetime import datetime

DOTENV_PATH = os.path.expanduser("~/relentless-af-academy/.env.local")
SNAPSHOT_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "content-snapshots")


def load_env():
    env = {}
    with open(DOTENV_PATH) as f:
        for line in f:
            line = line.strip()
            if "=" in line and not line.startswith("#"):
                key, val = line.split("=", 1)
                env[key.strip()] = val.strip()
    return env


def main():
    env = load_env()
    url = env["NEXT_PUBLIC_SUPABASE_URL"]
    key = env["SUPABASE_SERVICE_ROLE_KEY"]

    req = urllib.request.Request(
        f"{url}/rest/v1/modules?select=id,title,tier,module_type,order_index,description,content,platform,external_url,estimated_duration_mins&order=order_index",
        headers={"apikey": key, "Authorization": f"Bearer {key}"},
    )
    resp = urllib.request.urlopen(req)
    modules = json.loads(resp.read())

    os.makedirs(SNAPSHOT_DIR, exist_ok=True)
    timestamp = datetime.now().strftime("%Y-%m-%d-%H%M%S")
    filepath = os.path.join(SNAPSHOT_DIR, f"modules-{timestamp}.json")

    with open(filepath, "w") as f:
        json.dump(modules, f, indent=2)

    print(f"Snapshot: {filepath} ({len(modules)} modules)")


if __name__ == "__main__":
    main()
