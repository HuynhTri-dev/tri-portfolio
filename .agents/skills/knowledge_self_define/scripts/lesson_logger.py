#!/usr/bin/env python3
"""
@name lesson_logger.py
@description Dedicated CLI tool to formulate, log, and persist self-defined engineering lessons and troubleshooting case studies to Cloudflare D1 via the Knowledge Base REST API and local Git-tracked Markdown collections.
"""

from __future__ import annotations

import os
import sys
import re
import json
import argparse
import datetime
import urllib.request
import urllib.parse
import urllib.error
from pathlib import Path

DEFAULT_BASE_URL = os.environ.get("KB_BASE_URL", "https://trihuynh.omnimer.io.vn")
FALLBACK_BASE_URL = "https://tri-portfolio.huynhminhtri1109.workers.dev"
DEFAULT_API_KEY = os.environ.get("KB_API_KEY", "tri-kb-secret-key-2026")


def slugify(text: str) -> str:
    """
    Transforms text into a clean kebab-case URL slug.

    :param text: Raw string input
    :return: Cleaned kebab-case slug
    """
    text = text.lower().strip()
    text = re.sub(r"[^\w\s-]", "", text)
    text = re.sub(r"[\s_]+", "-", text)
    text = re.sub(r"-+", "-", text)
    return text.strip("-")


def make_request(
    url: str,
    method: str = "GET",
    data: dict | None = None,
    api_key: str | None = None,
) -> tuple[int, dict | str]:
    """
    Sends an HTTP request with Cloudflare WAF-compatible User-Agent and JSON headers.

    :param url: Target URL
    :param method: HTTP method ('GET', 'POST')
    :param data: Optional dictionary body
    :param api_key: Optional Bearer token
    :return: Tuple of (status_code, response_data)
    """
    headers = {
        "User-Agent": "Antigravity-KB-LessonLogger/2.0 (macOS; Self-Define Knowledge Agent)",
        "Accept": "application/json, text/plain, */*",
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
    Sends request to base_url, attempting fallback to FALLBACK_BASE_URL upon 500/connection error.

    :param endpoint_path: Path starting with '/'
    :param method: HTTP method
    :param data: Optional dictionary body
    :param api_key: Optional Bearer token
    :param base_url: Primary root URL
    :return: Tuple of (status_code, response_data)
    """
    url = f"{base_url.rstrip('/')}{endpoint_path}"
    status, res = make_request(url, method=method, data=data, api_key=api_key)

    if status >= 500 and base_url != FALLBACK_BASE_URL:
        fb_url = f"{FALLBACK_BASE_URL.rstrip('/')}{endpoint_path}"
        status_fb, res_fb = make_request(fb_url, method=method, data=data, api_key=api_key)
        if status_fb < 500:
            return status_fb, res_fb

    return status, res


def list_parent_articles(base_url: str = DEFAULT_BASE_URL) -> list[dict]:
    """
    Retrieves available knowledge base articles to attach troubleshooting lessons to.

    :param base_url: API root URL
    :return: List of article dicts with slug and title
    """
    _, res = request_with_fallback("/api/kb?limit=50", base_url=base_url)
    if isinstance(res, dict) and "articles" in res:
        return res["articles"]
    return []


def push_problem_to_api(
    parent_slug: str,
    payload: dict,
    api_key: str = DEFAULT_API_KEY,
    base_url: str = DEFAULT_BASE_URL,
) -> tuple[int, dict | str]:
    """
    Posts the lesson problem record to the Knowledge Base REST API.

    :param parent_slug: Parent article slug
    :param payload: Lesson payload dictionary
    :param api_key: Bearer token
    :param base_url: API root URL
    :return: Tuple of (status_code, response_dict)
    """
    endpoint = f"/api/kb/{urllib.parse.quote(parent_slug)}/problems"
    return request_with_fallback(
        endpoint,
        method="POST",
        data=payload,
        api_key=api_key,
        base_url=base_url,
    )


def save_local_markdown(
    parent_slug: str,
    lesson_slug: str,
    title: str,
    error_code: str,
    environment: str,
    error_snippet: str,
    root_cause: str,
    solution: str,
    tags: list[str],
    workspace_root: Path | None = None,
) -> Path:
    """
    Writes a formatted problem markdown file to src/content/problems/<parent_slug>/<lesson_slug>.md.

    :param parent_slug: Parent article slug
    :param lesson_slug: Specific file name slug
    :param title: Problem title
    :param error_code: Error code identifier
    :param environment: Environment details
    :param error_snippet: Stack trace or error log
    :param root_cause: 5-Whys root cause analysis
    :param solution: Verified resolution & takeaways
    :param tags: Tag list
    :param workspace_root: Optional path to repo root
    :return: Path to saved markdown file
    """
    if workspace_root is None:
        workspace_root = Path(__file__).resolve().parents[4]

    target_dir = workspace_root / "src" / "content" / "problems" / parent_slug
    target_dir.mkdir(parents=True, exist_ok=True)

    target_file = target_dir / f"{lesson_slug}.md"
    now_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()

    tags_yaml = "\n".join(f"  - {t}" for t in tags) if tags else "  - lesson-learned"

    clean_title = title.replace('"', '\\"')
    clean_env = environment.replace('"', '\\"')

    content = f"""---
title: "{clean_title}"
parentSlug: "{parent_slug}"
errorCode: "{error_code}"
environment: "{clean_env}"
tags:
{tags_yaml}
date: "{now_iso}"
---

## Error Symptoms
```
{error_snippet.strip()}
```

## Root Cause
{root_cause.strip()}

## Verified Solution
{solution.strip()}
"""
    with open(target_file, "w", encoding="utf-8") as f:
        f.write(content)

    return target_file


def main():
    parser = argparse.ArgumentParser(
        description="Self-Defined Engineering Lesson & Troubleshooting Logger CLI"
    )
    parser.add_argument(
        "--base-url",
        default=DEFAULT_BASE_URL,
        help=f"Knowledge Base API URL (default: {DEFAULT_BASE_URL})",
    )
    parser.add_argument(
        "--api-key",
        default=DEFAULT_API_KEY,
        help="Authorization Bearer token",
    )

    subparsers = parser.add_subparsers(dest="command", required=True)

    # Subcommand: list-parents
    subparsers.add_parser("list-parents", help="List parent article slugs available in Knowledge Base")

    # Subcommand: template
    p_tpl = subparsers.add_parser("template", help="Generate or print a blank lesson JSON template")
    p_tpl.add_argument("-o", "--output", help="Optional output file path")

    # Subcommand: log
    p_log = subparsers.add_parser("log", help="Log a self-defined engineering lesson to API and local Git files")
    p_log.add_argument("--parent", help="Parent article slug (required unless in payload file)")
    p_log.add_argument("-f", "--file", help="Path to JSON file containing payload (or '-' for stdin)")
    p_log.add_argument("--title", help="Clear symptom or lesson title")
    p_log.add_argument("--error-code", default="", help="Machine error code or conceptual gotcha identifier")
    p_log.add_argument("--snippet", default="", help="Error log, terminal output, or anti-pattern code snippet")
    p_log.add_argument("--env", default="", help="Environment and runtime versions")
    p_log.add_argument("--root-cause", help="5-Whys root cause analysis")
    p_log.add_argument("--solution", help="Verified code fix, guardrails, and personal takeaway")
    p_log.add_argument("--tags", default="", help="Comma-separated tags")
    p_log.add_argument("--slug", help="Optional specific slug for local markdown file")
    p_log.add_argument(
        "--save-local",
        action="store_true",
        default=True,
        help="Save markdown file to src/content/problems/<parent>/ (default: True)",
    )
    p_log.add_argument(
        "--no-save-local",
        action="store_false",
        dest="save_local",
        help="Skip saving local markdown file",
    )
    p_log.add_argument(
        "--api",
        action="store_true",
        default=True,
        help="Push directly to Knowledge Base REST API (default: True)",
    )
    p_log.add_argument(
        "--no-api",
        action="store_false",
        dest="api",
        help="Skip publishing to remote REST API",
    )

    args = parser.parse_args()

    if args.command == "list-parents":
        parents = list_parent_articles(base_url=args.base_url)
        if not parents:
            print("No articles retrieved. Check network or API base URL.", file=sys.stderr)
            sys.exit(1)
        print("\nAvailable Knowledge Base Parent Articles:\n" + "-" * 50)
        for p in parents:
            print(f"• Slug: {p['slug']}")
            print(f"  Title: {p.get('title', 'N/A')}")
            print(f"  Category: {p.get('kbCategory', p.get('category', 'general'))}\n")

    elif args.command == "template":
        template_data = {
            "parentSlug": "kafka-core-concepts-and-architecture",
            "title": "Clear Symptom or Gotcha Title (e.g. Memory Leak in Event Stream)",
            "errorCode": "ERR_CUSTOM_OR_MACHINE_CODE",
            "errorSnippet": "Stack trace, terminal output, or problematic code snippet...",
            "environment": "macOS, Node.js v22, Cloudflare Workers, PostgreSQL 16",
            "rootCause": "### 5-Whys Analysis\n1. Why did it fail? ...\n2. Why? ...\n3. Core flaw: ...",
            "solution": "## 1. Verified Resolution\n```ts\n// Fix code\n```\n\n## 2. Guardrails\n* Lint / architectural rule\n\n## 3. Personal Engineering Takeaway\n> Key heuristic or invariant.",
            "tags": ["runtime", "debugging", "lesson-learned", "postmortem"],
        }
        json_str = json.dumps(template_data, indent=2, ensure_ascii=False)
        if args.output:
            with open(args.output, "w", encoding="utf-8") as f:
                f.write(json_str)
            print(f"Template saved to: {args.output}")
        else:
            print(json_str)

    elif args.command == "log":
        payload = {}
        parent_slug = args.parent

        if args.file:
            if args.file == "-":
                payload = json.load(sys.stdin)
            else:
                with open(args.file, "r", encoding="utf-8") as f:
                    payload = json.load(f)
            if not parent_slug:
                parent_slug = payload.get("parentSlug")
        else:
            if not parent_slug or not args.title or not args.root_cause or not args.solution:
                print(
                    "Error: Missing required fields: --parent, --title, --root-cause, --solution (or provide -f/--file)",
                    file=sys.stderr,
                )
                sys.exit(1)
            tags = [t.strip() for t in args.tags.split(",") if t.strip()]
            payload = {
                "title": args.title,
                "errorCode": args.error_code,
                "errorSnippet": args.snippet,
                "environment": args.env,
                "rootCause": args.root_cause,
                "solution": args.solution,
                "tags": tags,
            }

        if not parent_slug:
            print("Error: Parent article slug must be specified via --parent or 'parentSlug' in payload file.", file=sys.stderr)
            sys.exit(1)

        title = payload.get("title", "Untitled Lesson")
        error_code = payload.get("errorCode", "")
        error_snippet = payload.get("errorSnippet", "")
        environment = payload.get("environment", "")
        root_cause = payload.get("rootCause", "")
        solution = payload.get("solution", "")
        tags = payload.get("tags", [])
        lesson_slug = args.slug or slugify(title)

        results = {}

        # 1. Local Markdown Generation
        if args.save_local:
            try:
                saved_path = save_local_markdown(
                    parent_slug=parent_slug,
                    lesson_slug=lesson_slug,
                    title=title,
                    error_code=error_code,
                    environment=environment,
                    error_snippet=error_snippet,
                    root_cause=root_cause,
                    solution=solution,
                    tags=tags,
                )
                results["localMarkdown"] = str(saved_path)
                print(f"✓ Local Markdown created: {saved_path}")
            except Exception as e:
                print(f"Warning: Failed to save local markdown: {e}", file=sys.stderr)

        # 2. Remote API Ingestion
        if args.api:
            api_payload = {
                "title": title,
                "errorCode": error_code,
                "errorSnippet": error_snippet,
                "environment": environment,
                "rootCause": root_cause,
                "solution": solution,
                "tags": tags,
            }
            status, res = push_problem_to_api(
                parent_slug=parent_slug,
                payload=api_payload,
                api_key=args.api_key,
                base_url=args.base_url,
            )
            results["apiStatus"] = status
            results["apiResponse"] = res
            if status < 300:
                print(f"✓ Remote D1 Knowledge Base updated via API (Status: {status})")
            else:
                print(f"Notice: API responded with status {status}: {res}", file=sys.stderr)

        print("\nSummary:")
        print(json.dumps(results, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
