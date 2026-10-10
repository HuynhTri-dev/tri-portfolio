#!/usr/bin/env python3
"""
@name kb_helper.py
@description CLI and programmatic helper for Knowledge Base REST API and Troubleshooting Engine.
"""

from __future__ import annotations

import os
import sys
import json
import argparse
import urllib.request
import urllib.parse
import urllib.error

DEFAULT_BASE_URL = os.environ.get("KB_BASE_URL", "https://trihuynh.omnimer.io.vn")
DEFAULT_API_KEY = os.environ.get("KB_API_KEY", "tri-kb-secret-key-2026")


def make_request(url: str, method: str = "GET", data: dict | None = None, api_key: str | None = None) -> dict | str:
    """
    Sends an HTTP request to the Knowledge Base API.

    :param url: Full endpoint URL
    :param method: HTTP method ('GET', 'POST', 'PUT')
    :param data: Optional dictionary payload for POST/PUT
    :param api_key: Optional Bearer token
    :return: Parsed JSON dictionary or raw string response
    """
    headers = {
        "User-Agent": "Antigravity-KB-Helper/1.0",
        "Accept": "application/json, text/markdown",
    }
    if api_key:
        headers["Authorization"] = f"Bearer {api_key}"

    body_bytes = None
    if data is not None:
        headers["Content-Type"] = "application/json"
        body_bytes = json.dumps(data).encode("utf-8")

    req = urllib.request.Request(url, data=body_bytes, headers=headers, method=method)

    try:
        with urllib.request.urlopen(req, timeout=15) as response:
            content_type = response.headers.get("Content-Type", "")
            raw = response.read().decode("utf-8")
            if "application/json" in content_type:
                return json.loads(raw)
            return raw
    except urllib.error.HTTPError as e:
        error_body = e.read().decode("utf-8")
        try:
            return json.loads(error_body)
        except Exception:
            return {"success": False, "status": e.code, "error": error_body}
    except Exception as e:
        return {"success": False, "error": str(e)}


def search(query: str, search_type: str = "all", limit: int = 10, base_url: str = DEFAULT_BASE_URL) -> dict:
    """
    Searches the Knowledge Base using FTS5 BM25.

    :param query: Search keywords
    :param search_type: 'all', 'article', or 'problem'
    :param limit: Max items to return
    :param base_url: API root URL
    :return: Search result dict
    """
    params = urllib.parse.urlencode({"q": query, "type": search_type, "limit": limit})
    url = f"{base_url.rstrip('/')}/api/kb/search?{params}"
    return make_request(url)


def get_raw_article(slug: str, base_url: str = DEFAULT_BASE_URL) -> str:
    """
    Retrieves the raw Markdown of an article.

    :param slug: Article slug
    :param base_url: API root URL
    :return: Raw Markdown string
    """
    url = f"{base_url.rstrip('/')}/api/kb/{slug}?format=raw"
    return make_request(url)


def create_article(
    slug: str,
    title: str,
    description: str,
    content: str,
    category: str = "general",
    summary_for_agents: str = "",
    target_agents: list | None = None,
    api_key: str = DEFAULT_API_KEY,
    base_url: str = DEFAULT_BASE_URL,
) -> dict:
    """
    Creates and indexes a new article in the Knowledge Base.

    :param slug: Unique kebab-case slug
    :param title: Article headline
    :param description: Short summary
    :param content: Full markdown body
    :param category: One of ['architecture', 'research', 'guidelines', 'devops', 'ai-agents', 'backend']
    :param summary_for_agents: High-density LLM summary
    :param target_agents: Target AI agents list
    :param api_key: Authorization token
    :param base_url: API root URL
    :return: API response dict
    """
    payload = {
        "slug": slug,
        "title": title,
        "description": description,
        "content": content,
        "isKnowledgeBase": True,
        "kbCategory": category,
        "summaryForAgents": summary_for_agents or description,
        "targetAgents": target_agents or ["claude", "cursor", "codex", "anti"],
    }
    url = f"{base_url.rstrip('/')}/api/kb"
    return make_request(url, method="POST", data=payload, api_key=api_key)


def add_problem(
    parent_slug: str,
    title: str,
    root_cause: str,
    solution: str,
    error_code: str = "",
    error_snippet: str = "",
    environment: str = "",
    tags: list | None = None,
    api_key: str = DEFAULT_API_KEY,
    base_url: str = DEFAULT_BASE_URL,
) -> dict:
    """
    Attaches a verified troubleshooting case study to a parent article.

    :param parent_slug: Parent article slug
    :param title: Symptom title
    :param root_cause: Analysis of failure
    :param solution: Verified fix
    :param error_code: Machine error code
    :param error_snippet: Stack trace / log
    :param environment: Runtime & OS details
    :param tags: Keywords list
    :param api_key: Authorization token
    :param base_url: API root URL
    :return: API response dict
    """
    payload = {
        "title": title,
        "errorCode": error_code,
        "errorSnippet": error_snippet,
        "environment": environment,
        "rootCause": root_cause,
        "solution": solution,
        "tags": tags or [],
    }
    url = f"{base_url.rstrip('/')}/api/kb/{parent_slug}/problems"
    return make_request(url, method="POST", data=payload, api_key=api_key)


def main():
    parser = argparse.ArgumentParser(description="Knowledge Base REST API CLI Helper")
    subparsers = parser.add_subparsers(dest="command", required=True)

    # Subcommand: search
    search_parser = subparsers.add_parser("search", help="Search articles and problems via FTS5")
    search_parser.add_argument("query", help="Keyword or phrase to search")
    search_parser.add_argument("--type", choices=["all", "article", "problem"], default="all")
    search_parser.add_argument("--limit", type=int, default=10)

    # Subcommand: get-raw
    raw_parser = subparsers.add_parser("get-raw", help="Fetch raw markdown of an article")
    raw_parser.add_argument("slug", help="Slug of the article")

    # Subcommand: add-problem
    prob_parser = subparsers.add_parser("add-problem", help="Record a troubleshooting case study")
    prob_parser.add_argument("--parent", required=True, help="Parent article slug")
    prob_parser.add_argument("--title", required=True, help="Problem title")
    prob_parser.add_argument("--error-code", default="", help="Machine error code")
    prob_parser.add_argument("--error-snippet", default="", help="Error log snippet")
    prob_parser.add_argument("--env", default="", help="Environment details")
    prob_parser.add_argument("--root-cause", required=True, help="Root cause analysis")
    prob_parser.add_argument("--solution", required=True, help="Verified solution markdown")
    prob_parser.add_argument("--tags", default="", help="Comma-separated tags")

    # Subcommand: create-article
    art_parser = subparsers.add_parser("create-article", help="Create a new knowledge base article")
    art_parser.add_argument("--slug", required=True, help="Kebab-case slug")
    art_parser.add_argument("--title", required=True, help="Article title")
    art_parser.add_argument("--description", required=True, help="Short description")
    art_parser.add_argument("--content", required=True, help="Markdown content")
    art_parser.add_argument("--category", default="general", help="Category")
    art_parser.add_argument("--summary", default="", help="Summary for agents")

    args = parser.parse_args()

    if args.command == "search":
        res = search(args.query, search_type=args.type, limit=args.limit)
        print(json.dumps(res, indent=2, ensure_ascii=False))

    elif args.command == "get-raw":
        res = get_raw_article(args.slug)
        print(res)

    elif args.command == "add-problem":
        tags = [t.strip() for t in args.tags.split(",") if t.strip()]
        res = add_problem(
            parent_slug=args.parent,
            title=args.title,
            error_code=args.error_code,
            error_snippet=args.error_snippet,
            environment=args.env,
            root_cause=args.root_cause,
            solution=args.solution,
            tags=tags,
        )
        print(json.dumps(res, indent=2, ensure_ascii=False))

    elif args.command == "create-article":
        res = create_article(
            slug=args.slug,
            title=args.title,
            description=args.description,
            content=args.content,
            category=args.category,
            summary_for_agents=args.summary,
        )
        print(json.dumps(res, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
