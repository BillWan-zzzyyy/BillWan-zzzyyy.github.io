"""
Fetch GitHub star counts for every non-fork repo owned by the site's GitHub user
(`github_username` in _config.yml) plus every repo referenced via github_repo in
papers.bib (even if owned by someone else; deduplicated), and save to
_data/github_stars.json:

  total_stars   sum over the counted repos
  repos         {full_name: stars} for owned repos with >= 1 star and all papers.bib repos
  history       dated snapshots [{"date", "stars"}] of total_stars, sorted by date
  history_mode  "snapshot"; a previous history without it (old stargazer-timestamp
                format) is discarded

GitHub limits stargazer timestamps to repo admins, so the history is recorded by this
script itself: each run overwrites today's snapshot, or appends one when the history is
empty, the total changed, or the last snapshot is >= 7 days old (so flat weeks still plot).

If the owned-repo listing fails, papers.bib repos are fetched as before, the other
repos keep their cached counts (so a transient failure never shrinks the total), and
no snapshot is recorded. Failed fetches fall back to cached values and the script exits 1.

Usage: python _scripts/fetch_github_stars.py
"""

import json
import os
import re
import sys
import urllib.request
import urllib.error
from datetime import date, datetime, timedelta, timezone

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
REPO_ROOT = os.path.dirname(SCRIPT_DIR)
BIB_PATH = os.path.join(REPO_ROOT, "_bibliography", "papers.bib")
CONFIG_PATH = os.path.join(REPO_ROOT, "_config.yml")
OUTPUT_PATH = os.path.join(REPO_ROOT, "_data", "github_stars.json")

GITHUB_API = "https://api.github.com/repos/{}"
USER_REPOS_API = "https://api.github.com/users/{}/repos?type=owner&per_page=100&page={}"
TOKEN = os.environ.get("GITHUB_TOKEN", "")
HISTORY_MODE = "snapshot"
SNAPSHOT_MAX_AGE_DAYS = 7

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def extract_github_repos(bib_path: str) -> list[str]:
    """Extract all github_repo values from a .bib file."""
    pattern = re.compile(r"github_repo\s*=\s*\{([^}]+)\}")
    repos = []
    with open(bib_path, "r", encoding="utf-8") as f:
        for match in pattern.finditer(f.read()):
            repo = match.group(1).strip()
            if repo and repo not in repos:
                repos.append(repo)
    return repos


def read_github_username(config_path: str) -> str | None:
    """Read github_username from _config.yml (regex only; pyyaml isn't installed in CI)."""
    try:
        with open(config_path, "r", encoding="utf-8") as f:
            text = f.read()
    except OSError as e:
        print(f"  Error reading {config_path}: {e}", file=sys.stderr)
        return None
    match = re.search(r"^github_username:[ \t]*(.*)$", text, re.MULTILINE)
    if not match:
        return None
    value = re.sub(r"(?:^|\s)#.*$", "", match.group(1)).strip().strip("'\"").strip()
    return value or None


def fetch_owned_repos(user: str) -> dict[str, int] | None:
    """Fetch {full_name: stargazers_count} for every non-fork public repo owned by a user."""
    headers = {
        "Accept": "application/vnd.github+json",
        "User-Agent": "github-stars-fetcher",
    }
    if TOKEN:
        headers["Authorization"] = f"Bearer {TOKEN}"

    repos = {}
    page = 1
    while True:
        req = urllib.request.Request(USER_REPOS_API.format(user, page), headers=headers)
        try:
            with urllib.request.urlopen(req, timeout=15) as resp:
                items = json.loads(resp.read().decode())
        except urllib.error.HTTPError as e:
            print(f"  HTTP {e.code} listing repos of {user}: {e.reason}", file=sys.stderr)
            return None
        except Exception as e:
            print(f"  Error listing repos of {user}: {e}", file=sys.stderr)
            return None
        if not items:
            break
        for item in items:
            if not item.get("fork"):
                repos[item["full_name"]] = item.get("stargazers_count", 0)
        page += 1
    return repos


def fetch_stars(repo: str) -> int | None:
    """Fetch stargazers_count for a single repo via GitHub REST API."""
    url = GITHUB_API.format(repo)
    headers = {
        "Accept": "application/vnd.github+json",
        "User-Agent": "github-stars-fetcher",
    }
    if TOKEN:
        headers["Authorization"] = f"Bearer {TOKEN}"

    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            data = json.loads(resp.read().decode())
            return data.get("stargazers_count", 0)
    except urllib.error.HTTPError as e:
        print(f"  HTTP {e.code} for {repo}: {e.reason}", file=sys.stderr)
    except Exception as e:
        print(f"  Error fetching {repo}: {e}", file=sys.stderr)
    return None


def load_snapshots(existing: dict, today: str) -> list[dict]:
    """Previous snapshots, kept only if the file was already written in snapshot mode."""
    if existing.get("history_mode") != HISTORY_MODE:
        return []
    history = []
    for row in existing.get("history") or []:
        try:
            day = date.fromisoformat(row["date"]).isoformat()
            stars = int(row["stars"])
        except (TypeError, KeyError, ValueError):
            continue
        if day <= today:
            history.append({"date": day, "stars": stars})
    return sorted(history, key=lambda row: row["date"])


def add_snapshot(history: list[dict], total: int, today: str):
    """Overwrite today's snapshot, or append one if the total changed or the last is stale."""
    last = history[-1] if history else None
    if last and last["date"] == today:
        last["stars"] = total
    elif (
        last is None
        or last["stars"] != total
        or date.fromisoformat(today) - date.fromisoformat(last["date"]) >= timedelta(days=SNAPSHOT_MAX_AGE_DAYS)
    ):
        history.append({"date": today, "stars": total})


def load_existing() -> dict:
    if os.path.exists(OUTPUT_PATH):
        try:
            with open(OUTPUT_PATH, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            pass
    return {}


def save_output(data: dict):
    os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)
    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
        f.write("\n")
    print(f"Saved to {OUTPUT_PATH}")


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    if not os.path.exists(BIB_PATH):
        print(f"ERROR: {BIB_PATH} not found", file=sys.stderr)
        sys.exit(1)

    bib_repos = extract_github_repos(BIB_PATH)
    print(f"Found {len(bib_repos)} repo(s) in papers.bib")

    any_failure = False
    listing_failed = False
    owned = None
    user = read_github_username(CONFIG_PATH)
    if user:
        print(f"Listing non-fork repos owned by {user}...")
        owned = fetch_owned_repos(user)
    else:
        print(f"  github_username not found in {CONFIG_PATH}", file=sys.stderr)
    if owned is None:
        any_failure = True
        listing_failed = True
        owned = {}
        print("    -> listing failed, other repos keep their cached counts")
    else:
        print(f"    -> {len(owned)} non-fork repo(s)")

    existing = load_existing()
    existing_repos = existing.get("repos", {})

    result_repos: dict[str, int] = {}

    # papers.bib repos first (keyed by their bib spelling so the site's
    # repos[entry.github_repo] lookup resolves); owned ones reuse the listing count.
    owned_by_lower = {name.lower(): name for name in owned}
    for repo in bib_repos:
        owned_name = owned_by_lower.pop(repo.lower(), None)
        if owned_name is not None:
            result_repos[repo] = owned[owned_name]
            print(f"  {repo}: {owned[owned_name]} stars (from listing)")
            continue
        print(f"  Fetching stars for {repo}...")
        stars = fetch_stars(repo)
        if stars is not None:
            result_repos[repo] = stars
            print(f"    -> {stars} stars")
        else:
            any_failure = True
            fallback = existing_repos.get(repo, 0)
            result_repos[repo] = fallback
            print(f"    -> fetch failed, using cached value: {fallback}")

    if listing_failed:
        for name, count in existing_repos.items():
            result_repos.setdefault(name, count)

    # Remaining owned non-fork repos: keep only those with at least one star.
    for name in owned_by_lower.values():
        if owned[name] > 0:
            result_repos[name] = owned[name]
            print(f"  {name}: {owned[name]} stars")

    total = sum(result_repos.values())
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    history = load_snapshots(existing, today)
    if listing_failed:
        print("  Not recording a star snapshot (repo listing failed)")
    else:
        add_snapshot(history, total, today)

    data = {
        "total_stars": total,
        "last_updated": today,
        "repos": result_repos,
        "history_mode": HISTORY_MODE,
        "history": history,
    }

    print(f"Total stars: {total}")
    save_output(data)

    if any_failure:
        print("WARNING: Some repos failed to fetch. Cached values used.", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
