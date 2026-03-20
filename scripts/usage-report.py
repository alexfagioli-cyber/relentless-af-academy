#!/usr/bin/env python3
"""
Academy usage report — run at the start of sessions to see what's happening.
Shows: active users, module completion, recent activity, errors.
"""

import json
import os
import urllib.request
from datetime import datetime, timedelta, timezone

DOTENV_PATH = os.path.expanduser("~/relentless-af-academy/.env.local")


def load_env():
    env = {}
    with open(DOTENV_PATH) as f:
        for line in f:
            line = line.strip()
            if "=" in line and not line.startswith("#"):
                key, val = line.split("=", 1)
                env[key.strip()] = val.strip()
    return env


def query(url, key, path):
    req = urllib.request.Request(
        f"{url}/rest/v1/{path}",
        headers={"apikey": key, "Authorization": f"Bearer {key}"},
    )
    resp = urllib.request.urlopen(req)
    return json.loads(resp.read())


def main():
    env = load_env()
    url = env["NEXT_PUBLIC_SUPABASE_URL"]
    key = env["SUPABASE_SERVICE_ROLE_KEY"]

    now = datetime.now(timezone.utc)
    yesterday = (now - timedelta(hours=24)).strftime("%Y-%m-%dT%H:%M:%SZ")
    week_ago = (now - timedelta(days=7)).strftime("%Y-%m-%dT%H:%M:%SZ")

    # Active users (last 24h)
    profiles = query(url, key, "learner_profiles?select=display_name,tier,last_active_at,streak_current&order=last_active_at.desc")

    print("=" * 50)
    print("RELENTLESSAF ACADEMY — USAGE REPORT")
    print(f"Generated: {now.strftime('%d %b %Y %H:%M')} UTC")
    print("=" * 50)

    print(f"\n--- USERS ({len(profiles)}) ---")
    for p in profiles:
        last = p.get("last_active_at", "")[:16].replace("T", " ") if p.get("last_active_at") else "never"
        streak = p.get("streak_current", 0)
        tier = p.get("tier") or "—"
        name = p.get("display_name") or "?"
        active_marker = " *" if p.get("last_active_at", "") > yesterday else ""
        print(f"  {name:<25} tier: {tier:<12} streak: {streak}  last: {last}{active_marker}")

    # Completion stats
    progress = query(url, key, "progress?select=status")
    total = len(progress)
    completed = sum(1 for p in progress if p["status"] == "completed")
    in_progress = sum(1 for p in progress if p["status"] == "in_progress")
    print(f"\n--- PROGRESS ---")
    print(f"  Total module starts: {total}")
    print(f"  Completed: {completed}")
    print(f"  In progress: {in_progress}")

    # Recent learning events (24h)
    events = query(url, key, f"learning_events?select=verb,object_type,created_at&created_at=gt.{yesterday}&order=created_at.desc")
    print(f"\n--- ACTIVITY (last 24h) ---")
    if events:
        verb_counts: dict[str, int] = {}
        for e in events:
            verb_counts[e["verb"]] = verb_counts.get(e["verb"], 0) + 1
        for verb, count in sorted(verb_counts.items(), key=lambda x: -x[1]):
            print(f"  {verb}: {count}")
    else:
        print("  No activity")

    # Recent feedback (7 days)
    feedback = query(url, key, f"general_feedback?select=rating,created_at&created_at=gt.{week_ago}")
    mod_feedback = query(url, key, f"module_feedback?select=rating,created_at&created_at=gt.{week_ago}")
    all_feedback = feedback + mod_feedback
    print(f"\n--- FEEDBACK (last 7 days): {len(all_feedback)} items ---")
    if all_feedback:
        rating_counts: dict[str, int] = {}
        for f in all_feedback:
            rating_counts[f["rating"]] = rating_counts.get(f["rating"], 0) + 1
        for rating, count in sorted(rating_counts.items(), key=lambda x: -x[1]):
            print(f"  {rating}: {count}")

    # Errors (7 days)
    try:
        errors = query(url, key, f"platform_errors?select=id,created_at&created_at=gt.{week_ago}")
        print(f"\n--- ERRORS (last 7 days): {len(errors)} ---")
    except Exception:
        print(f"\n--- ERRORS: table not accessible ---")

    print()


if __name__ == "__main__":
    main()
