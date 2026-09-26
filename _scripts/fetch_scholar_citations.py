"""
Fetch Google Scholar citation data and save to _data/scholar_citations.json.

Uses SerpAPI's Google Scholar Author API when SERPAPI_KEY is set (CI, whose
runner IPs Google Scholar blocks); otherwise, or if SerpAPI fails, scrapes
Google Scholar directly with scholarly.

Usage: python _scripts/fetch_scholar_citations.py
"""

import json
import os
import sys
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime, timezone

import yaml

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
REPO_ROOT = os.path.dirname(SCRIPT_DIR)
CONFIG_PATH = os.path.join(REPO_ROOT, "_config.yml")
OUTPUT_PATH = os.path.join(REPO_ROOT, "_data", "scholar_citations.json")
SERPAPI_URL = "https://serpapi.com/search.json"
SERPAPI_PAGE_SIZE = 100
SERPAPI_MAX_PAGES = 5

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


def _as_list(value) -> list:
    return value if isinstance(value, list) else []


def _to_int(value) -> int:
    """int(value), treating missing/null/garbage as 0."""
    try:
        return int(value)
    except (TypeError, ValueError):
        return 0


def _redact(text, api_key: str) -> str:
    return str(text).replace(api_key, "***")


def _serpapi_get(params: dict, api_key: str) -> dict:
    """GET one SerpAPI page and decode its JSON body. Never logs the key."""
    query = urllib.parse.urlencode({**params, "api_key": api_key})
    req = urllib.request.Request(
        f"{SERPAPI_URL}?{query}", headers={"User-Agent": "scholar-citations-fetcher"}
    )
    with urllib.request.urlopen(req, timeout=30) as resp:
        return json.loads(resp.read().decode())


def fetch_serpapi(scholar_id: str, api_key: str):
    """Fetch the profile via SerpAPI's Google Scholar Author API.

    Returns a scholarly-shaped author dict (citedby, publications,
    cites_per_year) so build_output() handles both sources, or None on failure.
    """
    articles, cited_by = [], {}
    for page in range(SERPAPI_MAX_PAGES):
        start = page * SERPAPI_PAGE_SIZE
        print(f"Fetching Google Scholar profile for user: {scholar_id} (SerpAPI, start={start})...")
        params = {
            "engine": "google_scholar_author",
            "author_id": scholar_id,
            "num": SERPAPI_PAGE_SIZE,
            "start": start,
        }
        try:
            data = _serpapi_get(params, api_key)
        except urllib.error.HTTPError as e:
            detail = ""
            try:
                detail = json.loads(e.read().decode()).get("error", "")
            except Exception:
                pass
            print(f"SerpAPI HTTP {e.code}: {_redact(detail or e.reason, api_key)}", file=sys.stderr)
            return None
        except Exception as e:
            print(f"SerpAPI request failed: {_redact(e, api_key)}", file=sys.stderr)
            return None

        if not isinstance(data, dict):
            print("SerpAPI returned unexpected JSON.", file=sys.stderr)
            return None
        if data.get("error"):
            # Paging past the last article yields a "no results" error; that just ends the list.
            if page > 0 and "hasn't returned any results" in str(data["error"]):
                break
            print(f"SerpAPI error: {_redact(data['error'], api_key)}", file=sys.stderr)
            return None

        if not cited_by and isinstance(data.get("cited_by"), dict):
            cited_by = data["cited_by"]
        batch = [a for a in _as_list(data.get("articles")) if isinstance(a, dict)]
        articles.extend(batch)
        if len(batch) < SERPAPI_PAGE_SIZE:
            break

    publications = []
    for art in articles:
        cb = art.get("cited_by")
        publications.append({
            # citation_id format: "userid:articleid", same as scholarly's author_pub_id
            "author_pub_id": str(art.get("citation_id") or ""),
            "num_citations": _to_int(cb.get("value") if isinstance(cb, dict) else None),
        })

    total = None
    for row in _as_list(cited_by.get("table")):
        cites = row.get("citations") if isinstance(row, dict) else None
        if isinstance(cites, dict) and cites.get("all") is not None:
            total = _to_int(cites["all"])
            break

    if not publications and total is None:
        print("SerpAPI returned no articles and no citation total.", file=sys.stderr)
        return None
    if total is None:
        total = sum(p["num_citations"] for p in publications)

    cites_per_year = {}
    for row in _as_list(cited_by.get("graph")):
        if isinstance(row, dict) and row.get("year") is not None:
            try:
                cites_per_year[int(row["year"])] = _to_int(row.get("citations"))
            except (TypeError, ValueError):
                pass

    return {"citedby": total, "publications": publications, "cites_per_year": cites_per_year}


def fetch_author(scholar_id: str):
    """Try direct fetch first; fall back to free proxies if blocked (not in CI)."""
    from scholarly import scholarly, ProxyGenerator

    # Attempt 1: direct connection
    try:
        print(f"Fetching Google Scholar profile for user: {scholar_id} (direct)...")
        author = scholarly.search_author_id(scholar_id)
        author = scholarly.fill(author, sections=["basics", "counts", "publications"])
        return author
    except Exception as e:
        print(f"Direct fetch failed: {e}", file=sys.stderr)

    # Attempt 2: free proxies -- skipped in CI, where it is slow and broken
    if os.environ.get("CI") == "true":
        print("Skipping free-proxy retry in CI.", file=sys.stderr)
        return None
    try:
        print("Retrying with free proxy...", file=sys.stderr)
        pg = ProxyGenerator()
        pg.FreeProxies()
        scholarly.use_proxy(pg)
        author = scholarly.search_author_id(scholar_id)
        author = scholarly.fill(author, sections=["basics", "counts", "publications"])
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

    # Per-year (non-cumulative) citation counts for the whole profile,
    # from the "counts" section: {int_year: int} -> {"YYYY": int}, sorted.
    cites_per_year = {
        str(year): int(count)
        for year, count in sorted((author.get("cites_per_year") or {}).items())
    }

    return {
        "total_citations": total,
        "last_updated": datetime.now(timezone.utc).strftime("%Y-%m-%d"),
        "articles": articles,
        "cites_per_year": cites_per_year,
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
    author = None
    api_key = os.environ.get("SERPAPI_KEY", "").strip()
    if api_key:
        author = fetch_serpapi(scholar_id, api_key)
        if author is None:
            print("SerpAPI fetch failed; falling back to scholarly.", file=sys.stderr)
    if author is None:
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
