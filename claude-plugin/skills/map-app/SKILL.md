---
name: map-app
description: Crawl a site and produce a Markdown map of its pages and features. Use when asked to document an app, its routes, or its navigation.
---

# Map and document an app

Crawl an app breadth-first and produce a structured document of what it contains.

## Workflow

1. `browser_navigate` to the start URL.
2. On each page, capture the title (`browser_get_page_title`), the visible content
   (`browser_get_page_text`), the links/buttons (`browser_list_clickable`), and the inputs
   (`browser_list_page_inputs`).
3. Follow internal links up to the requested depth, skipping external hosts, auth redirects,
   and destructive actions (logout, delete). Track visited URLs to avoid loops.
4. Note any console errors encountered with `browser_get_console_log`.

## Output

Write a Markdown document with one section per page: the URL, a one-line summary, its purpose,
its main interactive elements, and any problems found. Include a short table of contents at
the top. State the crawl depth and any pages you deliberately skipped.
