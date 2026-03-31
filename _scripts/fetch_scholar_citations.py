"""
Fetch Google Scholar citation data and save to _data/scholar_citations.json.

Usage: python _scripts/fetch_scholar_citations.py
"""

import json
import os
import sys
from datetime import datetime, timezone

import yaml

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
REPO_ROOT = os.path.dirname(SCRIPT_DIR)
CONFIG_PATH = os.path.join(REPO_ROOT, "_config.yml")
OUTPUT_PATH = os.path.join(REPO_ROOT, "_data", "scholar_citations.json")

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def load_scholar_userid():
    with open(CONFIG_PATH, "r", encoding="utf-8") as f:
        config = yaml.safe_load(f)
    uid = config.get("scholar_userid", "").strip()
    if not uid:
        print("ERROR: scholar_userid not found in _config.yml", file=sys.stderr)
        sys.exit(1)
    return uid


def fetch_author(scholar_id: str):
    """Try direct fetch first; fall back to free proxies if blocked."""
    from scholarly import scholarly, ProxyGenerator

    # Attempt 1: direct connection
    try:
        print(f"Fetching Google Scholar profile for user: {scholar_id} (direct)...")
        author = scholarly.search_author_id(scholar_id)
        author = scholarly.fill(author, sections=["basics", "publications"])
        return author
    except Exception as e:
        print(f"Direct fetch failed: {e}", file=sys.stderr)

    # Attempt 2: free proxies
    try:
        print("Retrying with free proxy...", file=sys.stderr)
        pg = ProxyGenerator()
        pg.FreeProxies()
        scholarly.use_proxy(pg)
        author = scholarly.search_author_id(scholar_id)
        author = scholarly.fill(author, sections=["basics", "publications"])
        return author
    except Exception as e:
        print(f"Proxy fetch also failed: {e}", file=sys.stderr)
        return None


def build_output(author: dict, scholar_id: str) -> dict:
    total = author.get("citedby", 0)
    articles = {}

    for pub in author.get("publications", []):
        pub_id = pub.get("author_pub_id", "")
        # pub_id format: "userid:articleid"
        if ":" in pub_id:
            article_id = pub_id.split(":", 1)[1]
            citations = pub.get("num_citations", 0)
            articles[article_id] = citations

    return {
        "total_citations": total,
        "last_updated": datetime.now(timezone.utc).strftime("%Y-%m-%d"),
        "articles": articles,
    }


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
    scholar_id = load_scholar_userid()
    author = fetch_author(scholar_id)

    if author is None:
        print(
            "ERROR: Could not fetch citation data. Keeping existing data unchanged.",
            file=sys.stderr,
        )
        if not os.path.exists(OUTPUT_PATH):
            # No existing data; write empty skeleton so Jekyll doesn't error
            save_output({
                "total_citations": 0,
                "last_updated": datetime.now(timezone.utc).strftime("%Y-%m-%d"),
                "articles": {},
            })
        sys.exit(1)

    data = build_output(author, scholar_id)
    print(f"Total citations: {data['total_citations']}")
    for aid, cnt in data["articles"].items():
        print(f"  {aid}: {cnt}")

    save_output(data)


if __name__ == "__main__":
    main()
