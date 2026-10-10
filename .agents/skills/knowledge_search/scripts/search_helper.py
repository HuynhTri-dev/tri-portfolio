#!/usr/bin/env python3
"""
@name search_helper.py
@description Dedicated CLI and Python library for AI coding agents to search, discover, and retrieve Knowledge Base articles, sections, and troubleshooting case studies with zero token waste.
"""

from __future__ import annotations

import os
import sys
import json
import argparse
import urllib.request
import urllib.parse
import urllib.error

# Priority order for base URLs: environment variable -> custom domain -> workers.dev fallback
DEFAULT_BASE_URL = os.environ.get(
    "KB_BASE_URL",
    "https://trihuynh.omnimer.io.vn"
)
FALLBACK_BASE_URL = "https://tri-portfolio.huynhminhtri1109.workers.dev"


def make_request(url: str, headers: dict | None = None) -> tuple[int, dict | str]:
    """
    Sends an HTTP GET request to the Knowledge Base API with Cloudflare-compatible headers.

    :param url: Complete endpoint URL
    :param headers: Optional additional HTTP headers
    :return: Tuple of (status_code, parsed_json_or_raw_string)
    """
    req_headers = {
        "User-Agent": "Antigravity-KB-SearchHelper/2.0 (macOS; AI Agent Retrieval Engine)",
        "Accept": "application/json, text/markdown, text/plain, */*",
    }
    if headers:
        req_headers.update(headers)

    req = urllib.request.Request(url, headers=req_headers, method="GET")

    try:
        with urllib.request.urlopen(req, timeout=15) as response:
            status = response.status
            content_type = response.headers.get("Content-Type", "")
            raw = response.read().decode("utf-8")
            if "application/json" in content_type:
                try:
                    return status, json.loads(raw)
                except Exception:
                    return status, raw
            return status, raw
    except urllib.error.HTTPError as e:
        error_body = e.read().decode("utf-8")
        try:
            return e.code, json.loads(error_body)
        except Exception:
            return e.code, error_body
    except Exception as e:
        return 500, {"success": False, "error": str(e)}


def request_with_fallback(endpoint_path: str, base_url: str = DEFAULT_BASE_URL) -> tuple[int, dict | str]:
    """
    Executes a request against the primary base_url, falling back to FALLBACK_BASE_URL on network failure.

    :param endpoint_path: Path starting with '/' (e.g., '/api/kb/search?q=...')
    :param base_url: Primary API root URL
    :return: Tuple of (status_code, response_data)
    """
    url = f"{base_url.rstrip('/')}{endpoint_path}"
    status, res = make_request(url)

    # If primary host had connection/network error and is not the fallback, try fallback host
    if status == 500 and isinstance(res, dict) and "error" in res and base_url != FALLBACK_BASE_URL:
        fallback_url = f"{FALLBACK_BASE_URL.rstrip('/')}{endpoint_path}"
        status_fb, res_fb = make_request(fallback_url)
        if status_fb == 200:
            return status_fb, res_fb

    return status, res


def search(
    query: str,
    granularity: str = "all",
    format_type: str = "agent",
    include_solution: bool = False,
    limit: int = 10,
    base_url: str = DEFAULT_BASE_URL,
) -> dict | str:
    """
    Searches the Knowledge Base using FTS5 BM25 index with section granularity and optional agent plain text.

    :param query: Search query or error code
    :param granularity: 'all', 'section', 'article', or 'problem'
    :param format_type: 'agent' (compact plain text) or 'json' (full payload)
    :param include_solution: Whether to include the verified fix markdown in problem hits
    :param limit: Maximum items to return
    :param base_url: API root URL
    :return: Formatted plain text string or JSON dictionary
    """
    params_dict = {
        "q": query,
        "granularity": granularity,
        "format": format_type,
        "limit": str(limit),
    }
    if include_solution:
        params_dict["include"] = "solution"

    endpoint = f"/api/kb/search?{urllib.parse.urlencode(params_dict)}"
    _, res = request_with_fallback(endpoint, base_url=base_url)
    return res


def get_outline(slug: str, base_url: str = DEFAULT_BASE_URL) -> dict | str:
    """
    Retrieves an article's table of contents, headings, anchors, and section token counts (~150 tokens).

    :param slug: Article slug
    :param base_url: API root URL
    :return: Outline dict or string
    """
    endpoint = f"/api/kb/{urllib.parse.quote(slug)}?format=outline"
    _, res = request_with_fallback(endpoint, base_url=base_url)
    return res


def get_section(slug: str, anchor: str, base_url: str = DEFAULT_BASE_URL) -> str:
    """
    Fetches the raw Markdown content of ONLY a specific section (~200-400 tokens).
    Ensures non-ASCII anchor slugs (Vietnamese diacritics) are properly percent-encoded for Edge proxies.

    :param slug: Article slug
    :param anchor: Heading anchor (e.g. '72-cấu-hình-độ-an-toàn-acks-của-producer')
    :param base_url: API root URL
    :return: Raw section Markdown text
    """
    clean_anchor = anchor.lstrip("#")
    encoded_anchor = urllib.parse.quote(clean_anchor)
    endpoint = f"/api/kb/{urllib.parse.quote(slug)}?format=raw&section={encoded_anchor}"
    _, res = request_with_fallback(endpoint, base_url=base_url)
    if isinstance(res, dict):
        return json.dumps(res, indent=2, ensure_ascii=False)
    return res


def get_raw_article(slug: str, base_url: str = DEFAULT_BASE_URL) -> str:
    """
    Fetches the complete raw Markdown of an article.

    :param slug: Article slug
    :param base_url: API root URL
    :return: Full raw Markdown text
    """
    endpoint = f"/api/kb/{urllib.parse.quote(slug)}?format=raw"
    _, res = request_with_fallback(endpoint, base_url=base_url)
    if isinstance(res, dict):
        return json.dumps(res, indent=2, ensure_ascii=False)
    return res


def get_problems(parent_slug: str, base_url: str = DEFAULT_BASE_URL) -> dict | str:
    """
    Fetches all troubleshooting case studies attached to a parent article.

    :param parent_slug: Parent article slug
    :param base_url: API root URL
    :return: Dictionary of problems or string
    """
    endpoint = f"/api/kb/{urllib.parse.quote(parent_slug)}/problems"
    _, res = request_with_fallback(endpoint, base_url=base_url)
    return res


def get_misses(limit: int = 20, base_url: str = DEFAULT_BASE_URL) -> dict | str:
    """
    Fetches top zero-hit search queries to identify documentation gaps and missing keywords.

    :param limit: Number of top misses to retrieve
    :param base_url: API root URL
    :return: Dictionary of search misses
    """
    endpoint = f"/api/kb/misses?limit={limit}"
    _, res = request_with_fallback(endpoint, base_url=base_url)
    return res


def main():
    parser = argparse.ArgumentParser(
        description="Knowledge Base Search & Retrieval Helper for AI Coding Agents"
    )
    parser.add_argument(
        "--base-url",
        default=DEFAULT_BASE_URL,
        help=f"Base API URL (default: {DEFAULT_BASE_URL})",
    )

    subparsers = parser.add_subparsers(dest="command", required=True)

    # Subcommand: search
    p_search = subparsers.add_parser("query", help="Search knowledge base articles, sections, and problems")
    p_search.add_argument("query", help="Keyword, phrase, or error code")
    p_search.add_argument(
        "--granularity",
        choices=["all", "section", "article", "problem"],
        default="all",
        help="Search scope granularity (default: all)",
    )
    p_search.add_argument(
        "--format",
        choices=["agent", "json"],
        default="agent",
        help="Output format: compact 'agent' plain text or structured 'json' (default: agent)",
    )
    p_search.add_argument(
        "--include-solution",
        action="store_true",
        help="Include full problem verified solution markdown in hits",
    )
    p_search.add_argument(
        "--limit",
        type=int,
        default=10,
        help="Maximum number of results to return",
    )

    # Subcommand: outline
    p_outline = subparsers.add_parser("outline", help="Fetch table of contents and section token estimates")
    p_outline.add_argument("slug", help="Article slug")

    # Subcommand: section
    p_section = subparsers.add_parser("section", help="Fetch raw Markdown for a single heading section")
    p_section.add_argument("slug", help="Article slug")
    p_section.add_argument("anchor", help="Section heading anchor slug")

    # Subcommand: raw
    p_raw = subparsers.add_parser("raw", help="Fetch complete raw Markdown for an article")
    p_raw.add_argument("slug", help="Article slug")

    # Subcommand: problems
    p_prob = subparsers.add_parser("problems", help="Fetch all troubleshooting case studies for a parent article")
    p_prob.add_argument("slug", help="Parent article slug")

    # Subcommand: misses
    p_miss = subparsers.add_parser("misses", help="View zero-hit queries to identify knowledge gaps")
    p_miss.add_argument("--limit", type=int, default=20, help="Max items to retrieve")

    args = parser.parse_args()

    if args.command == "query":
        res = search(
            args.query,
            granularity=args.granularity,
            format_type=args.format,
            include_solution=args.include_solution,
            limit=args.limit,
            base_url=args.base_url,
        )
        if isinstance(res, dict):
            print(json.dumps(res, indent=2, ensure_ascii=False))
        else:
            print(res)

    elif args.command == "outline":
        res = get_outline(args.slug, base_url=args.base_url)
        if isinstance(res, dict):
            print(json.dumps(res, indent=2, ensure_ascii=False))
        else:
            print(res)

    elif args.command == "section":
        res = get_section(args.slug, args.anchor, base_url=args.base_url)
        print(res)

    elif args.command == "raw":
        res = get_raw_article(args.slug, base_url=args.base_url)
        print(res)

    elif args.command == "problems":
        res = get_problems(args.slug, base_url=args.base_url)
        if isinstance(res, dict):
            print(json.dumps(res, indent=2, ensure_ascii=False))
        else:
            print(res)

    elif args.command == "misses":
        res = get_misses(limit=args.limit, base_url=args.base_url)
        if isinstance(res, dict):
            print(json.dumps(res, indent=2, ensure_ascii=False))
        else:
            print(res)


if __name__ == "__main__":
    main()
