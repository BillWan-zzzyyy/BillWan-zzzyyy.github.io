"""
Fetch GitHub star counts for repos referenced in papers.bib
and save to _data/github_stars.json.

Usage: python _scripts/fetch_github_stars.py
"""

import json
import os
import re
import sys
import urllib.request
import urllib.error
from datetime import datetime, timezone

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
REPO_ROOT = os.path.dirname(SCRIPT_DIR)
BIB_PATH = os.path.join(REPO_ROOT, "_bibliography", "papers.bib")
OUTPUT_PATH = os.path.join(REPO_ROOT, "_data", "github_stars.json")

GITHUB_API = "https://api.github.com/repos/{}"
TOKEN = os.environ.get("GITHUB_TOKEN", "")

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

    repos = extract_github_repos(BIB_PATH)
    if not repos:
        print("No github_repo entries found in papers.bib")
        save_output({
            "total_stars": 0,
            "last_updated": datetime.now(timezone.utc).strftime("%Y-%m-%d"),
            "repos": {},
        })
        return

    print(f"Found {len(repos)} repo(s) in papers.bib")
    existing = load_existing()
    existing_repos = existing.get("repos", {})

    result_repos: dict[str, int] = {}
    any_failure = False

    for repo in repos:
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

    total = sum(result_repos.values())
    data = {
        "total_stars": total,
        "last_updated": datetime.now(timezone.utc).strftime("%Y-%m-%d"),
        "repos": result_repos,
    }

    print(f"Total stars: {total}")
    save_output(data)

    if any_failure:
        print("WARNING: Some repos failed to fetch. Cached values used.", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
