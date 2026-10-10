#!/usr/bin/env python3
"""
@name kb_helper.py
@description CLI and programmatic helper for Knowledge Base REST API, article authoring, troubleshooting case study logging, and disk-to-DB synchronization.
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
DEFAULT_BASE_URL = os.environ.get("KB_BASE_URL", "https://trihuynh.omnimer.io.vn")
FALLBACK_BASE_URL = "https://tri-portfolio.huynhminhtri1109.workers.dev"
DEFAULT_API_KEY = os.environ.get("KB_API_KEY", "tri-kb-secret-key-2026")


def make_request(
    url: str,
    method: str = "GET",
    data: dict | None = None,
    api_key: str | None = None,
) -> tuple[int, dict | str]:
    """
    Sends an HTTP request to the Knowledge Base API with proper headers and error handling.

    :param url: Complete endpoint URL
    :param method: HTTP method ('GET', 'POST', 'PUT')
    :param data: Optional dictionary payload for POST/PUT requests
    :param api_key: Optional Bearer authentication token
    :return: Tuple of (status_code, parsed_json_or_raw_string)
    """
    headers = {
        "User-Agent": "Antigravity-KB-Helper/2.0 (macOS; Edge Knowledge Engine)",
        "Accept": "application/json, text/markdown, text/plain, */*",
    }
    if api_key:
        headers["Authorization"] = f"Bearer {api_key}"

    body_bytes = None
    if data is not None:
        headers["Content-Type"] = "application/json"
        body_bytes = json.dumps(data, ensure_ascii=False).encode("utf-8")

    req = urllib.request.Request(url, data=body_bytes, headers=headers, method=method)

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
            return e.code, {"success": False, "status": e.code, "error": error_body}
    except Exception as e:
        return 500, {"success": False, "error": str(e)}


def request_with_fallback(
    endpoint_path: str,
    method: str = "GET",
    data: dict | None = None,
    api_key: str | None = None,
    base_url: str = DEFAULT_BASE_URL,
) -> tuple[int, dict | str]:
    """
    Executes a request against the primary base_url, falling back to FALLBACK_BASE_URL on network failure.

    :param endpoint_path: Endpoint path starting with '/'
    :param method: HTTP method
    :param data: Optional JSON payload dict
    :param api_key: Optional Bearer token
    :param base_url: Primary API root URL
    :return: Tuple of (status_code, response_data)
    """
    url = f"{base_url.rstrip('/')}{endpoint_path}"
    status, res = make_request(url, method=method, data=data, api_key=api_key)

    # Attempt fallback if connection failed and primary is not already fallback
    if status == 500 and isinstance(res, dict) and "error" in res and base_url != FALLBACK_BASE_URL:
        fallback_url = f"{FALLBACK_BASE_URL.rstrip('/')}{endpoint_path}"
        status_fb, res_fb = make_request(fallback_url, method=method, data=data, api_key=api_key)
        if status_fb < 500:
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
    Searches the Knowledge Base using FTS5 BM25 with section granularity and agent plain text output.

    :param query: Search keywords or error code
    :param granularity: 'all', 'section', 'article', or 'problem'
    :param format_type: 'json' or 'agent'
    :param include_solution: Whether to include full problem solution markdown
    :param limit: Max items to return
    :param base_url: API root URL
    :return: Search result dict or formatted text
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
    Retrieves the table of contents and token estimates for an article (~150 tokens).

    :param slug: Article slug
    :param base_url: API root URL
    :return: Outline dict or string
    """
    endpoint = f"/api/kb/{urllib.parse.quote(slug)}?format=outline"
    _, res = request_with_fallback(endpoint, base_url=base_url)
    return res


def get_section(slug: str, anchor: str, base_url: str = DEFAULT_BASE_URL) -> str:
    """
    Retrieves the raw Markdown of ONLY a specific section (~200-400 tokens).
    Properly encodes non-ASCII characters in anchors to prevent Edge HTTP 400 errors.

    :param slug: Article slug
    :param anchor: Section heading anchor slug
    :param base_url: API root URL
    :return: Raw section Markdown string
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
    Retrieves the full raw Markdown of an article.

    :param slug: Article slug
    :param base_url: API root URL
    :return: Raw Markdown string
    """
    endpoint = f"/api/kb/{urllib.parse.quote(slug)}?format=raw"
    _, res = request_with_fallback(endpoint, base_url=base_url)
    if isinstance(res, dict):
        return json.dumps(res, indent=2, ensure_ascii=False)
    return res


def get_misses(limit: int = 20, base_url: str = DEFAULT_BASE_URL) -> dict:
    """
    Retrieves top missed search queries to identify documentation gaps.

    :param limit: Max records
    :param base_url: API root URL
    :return: Dict with list of misses
    """
    endpoint = f"/api/kb/misses?limit={limit}"
    _, res = request_with_fallback(endpoint, base_url=base_url)
    return res


def create_article(
    payload: dict,
    api_key: str = DEFAULT_API_KEY,
    base_url: str = DEFAULT_BASE_URL,
) -> dict:
    """
    Creates and indexes a new article in the Knowledge Base.

    :param payload: Dictionary containing article properties:
                    slug, title, description, content, isKnowledgeBase,
                    kbCategory, summaryForAgents, targetAgents, hashtags.
    :param api_key: Authorization token
    :param base_url: API root URL
    :return: API response dict
    """
    endpoint = "/api/kb"
    _, res = request_with_fallback(
        endpoint,
        method="POST",
        data=payload,
        api_key=api_key,
        base_url=base_url,
    )
    return res


def update_article(
    slug: str,
    payload: dict,
    api_key: str = DEFAULT_API_KEY,
    base_url: str = DEFAULT_BASE_URL,
) -> dict:
    """
    Updates an existing article in the Knowledge Base.

    :param slug: Article slug
    :param payload: Updated fields dictionary
    :param api_key: Authorization token
    :param base_url: API root URL
    :return: API response dict
    """
    endpoint = f"/api/kb/{urllib.parse.quote(slug)}"
    _, res = request_with_fallback(
        endpoint,
        method="PUT",
        data=payload,
        api_key=api_key,
        base_url=base_url,
    )
    return res


def add_problem(
    parent_slug: str,
    payload: dict,
    api_key: str = DEFAULT_API_KEY,
    base_url: str = DEFAULT_BASE_URL,
) -> dict:
    """
    Attaches a verified troubleshooting case study to a parent article.

    :param parent_slug: Parent article slug
    :param payload: Problem details dictionary (title, errorCode, rootCause, solution, etc.)
    :param api_key: Authorization token
    :param base_url: API root URL
    :return: API response dict
    """
    endpoint = f"/api/kb/{urllib.parse.quote(parent_slug)}/problems"
    _, res = request_with_fallback(
        endpoint,
        method="POST",
        data=payload,
        api_key=api_key,
        base_url=base_url,
    )
    return res


def sync_database(
    api_key: str = DEFAULT_API_KEY,
    base_url: str = DEFAULT_BASE_URL,
) -> dict:
    """
    Triggers full synchronization of disk markdown files into Cloudflare D1.

    :param api_key: Authorization token
    :param base_url: API root URL
    :return: API response dict
    """
    endpoint = "/api/kb/sync"
    _, res = request_with_fallback(
        endpoint,
        method="POST",
        data={},
        api_key=api_key,
        base_url=base_url,
    )
    return res


def main():
    parser = argparse.ArgumentParser(
        description="Knowledge Base REST API CLI Helper: Article Authoring, Problem Logging, and Sync"
    )
    parser.add_argument(
        "--base-url",
        default=DEFAULT_BASE_URL,
        help=f"Root URL for API (default: {DEFAULT_BASE_URL})",
    )
    parser.add_argument(
        "--api-key",
        default=DEFAULT_API_KEY,
        help="Authorization Bearer token",
    )

    subparsers = parser.add_subparsers(dest="command", required=True)

    # Subcommand: search
    search_parser = subparsers.add_parser("search", help="Search articles, sections, and problems via FTS5")
    search_parser.add_argument("query", help="Keyword or natural language query")
    search_parser.add_argument("--granularity", choices=["all", "section", "article", "problem"], default="all")
    search_parser.add_argument("--format", choices=["json", "agent"], default="agent")
    search_parser.add_argument("--include-solution", action="store_true", help="Include full solution markdown")
    search_parser.add_argument("--limit", type=int, default=10)

    # Subcommand: get-outline
    outline_parser = subparsers.add_parser("get-outline", help="Fetch article table of contents and token counts")
    outline_parser.add_argument("slug", help="Slug of the article")

    # Subcommand: get-section
    section_parser = subparsers.add_parser("get-section", help="Fetch raw markdown of a single heading section")
    section_parser.add_argument("slug", help="Slug of the article")
    section_parser.add_argument("anchor", help="Heading anchor slug (e.g. 72-cấu-hình-acks)")

    # Subcommand: get-raw
    raw_parser = subparsers.add_parser("get-raw", help="Fetch full raw markdown of an article")
    raw_parser.add_argument("slug", help="Slug of the article")

    # Subcommand: get-misses
    misses_parser = subparsers.add_parser("get-misses", help="View top zero-hit search queries")
    misses_parser.add_argument("--limit", type=int, default=20)

    # Subcommand: create-article
    art_parser = subparsers.add_parser("create-article", help="Create a new knowledge base article")
    art_parser.add_argument("-f", "--file", help="Path to JSON file containing payload (or '-' for stdin)")
    art_parser.add_argument("--slug", help="Kebab-case slug")
    art_parser.add_argument("--title", help="Article title")
    art_parser.add_argument("--description", help="Short description")
    art_parser.add_argument("--content", help="Markdown content")
    art_parser.add_argument("--category", default="architecture", help="Category: architecture, devops, backend, etc.")
    art_parser.add_argument("--summary", default="", help="High-density summary for AI agents")

    # Subcommand: add-problem
    prob_parser = subparsers.add_parser("add-problem", help="Record a troubleshooting case study")
    prob_parser.add_argument("--parent", required=True, help="Parent article slug")
    prob_parser.add_argument("-f", "--file", help="Path to JSON file containing payload (or '-' for stdin)")
    prob_parser.add_argument("--title", help="Problem title")
    prob_parser.add_argument("--error-code", default="", help="Machine error code")
    prob_parser.add_argument("--error-snippet", default="", help="Error log snippet")
    prob_parser.add_argument("--env", default="", help="Environment details")
    prob_parser.add_argument("--root-cause", help="Root cause analysis")
    prob_parser.add_argument("--solution", help="Verified solution markdown")
    prob_parser.add_argument("--tags", default="", help="Comma-separated tags")

    # Subcommand: sync
    subparsers.add_parser("sync", help="Trigger disk to D1 SQLite database sync")

    args = parser.parse_args()

    if args.command == "search":
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

    elif args.command == "get-outline":
        res = get_outline(args.slug, base_url=args.base_url)
        if isinstance(res, dict):
            print(json.dumps(res, indent=2, ensure_ascii=False))
        else:
            print(res)

    elif args.command == "get-section":
        res = get_section(args.slug, args.anchor, base_url=args.base_url)
        print(res)

    elif args.command == "get-raw":
        res = get_raw_article(args.slug, base_url=args.base_url)
        print(res)

    elif args.command == "get-misses":
        res = get_misses(args.limit, base_url=args.base_url)
        print(json.dumps(res, indent=2, ensure_ascii=False))

    elif args.command == "create-article":
        payload = {}
        if args.file:
            if args.file == "-":
                payload = json.load(sys.stdin)
            else:
                with open(args.file, "r", encoding="utf-8") as f:
                    payload = json.load(f)
        else:
            if not args.slug or not args.title or not args.description or not args.content:
                print("Error: Missing required arguments: --slug, --title, --description, --content (or provide -f/--file)", file=sys.stderr)
                sys.exit(1)
            payload = {
                "slug": args.slug,
                "title": args.title,
                "description": args.description,
                "content": args.content,
                "isKnowledgeBase": True,
                "kbCategory": args.category,
                "summaryForAgents": args.summary or args.description,
                "targetAgents": ["claude", "cursor", "codex", "anti"],
            }

        res = create_article(payload, api_key=args.api_key, base_url=args.base_url)
        print(json.dumps(res, indent=2, ensure_ascii=False))

    elif args.command == "add-problem":
        payload = {}
        if args.file:
            if args.file == "-":
                payload = json.load(sys.stdin)
            else:
                with open(args.file, "r", encoding="utf-8") as f:
                    payload = json.load(f)
        else:
            if not args.title or not args.root_cause or not args.solution:
                print("Error: Missing required arguments: --title, --root-cause, --solution (or provide -f/--file)", file=sys.stderr)
                sys.exit(1)
            tags = [t.strip() for t in args.tags.split(",") if t.strip()]
            payload = {
                "title": args.title,
                "errorCode": args.error_code,
                "errorSnippet": args.error_snippet,
                "environment": args.env,
                "rootCause": args.root_cause,
                "solution": args.solution,
                "tags": tags,
            }

        res = add_problem(args.parent, payload, api_key=args.api_key, base_url=args.base_url)
        print(json.dumps(res, indent=2, ensure_ascii=False))

    elif args.command == "sync":
        res = sync_database(api_key=args.api_key, base_url=args.base_url)
        print(json.dumps(res, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
