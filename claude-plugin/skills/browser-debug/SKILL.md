---
name: browser-debug
description: Debug style issues and console errors in a running web app using the kogiQA browser tools. Use when asked to investigate a layout/overflow problem, a broken page, or to collect and fix console errors.
---

# Debug a web app in the browser

Use the kogiQA browser tools to reproduce, inspect, and diagnose front-end problems. The
browser is selector-free: describe what you want in natural language, then act on the tool
results.

## Workflow

1. `browser_navigate` to the page under test.
2. `browser_get_console_log` to read the current console messages. Clear the picture by
   revisiting the page after a reload if the log is stale.
3. `browser_get_network_history` to spot failed requests (4xx/5xx) and slow endpoints.
4. Reproduce the issue with `browser_click`, `browser_type`, `browser_scroll`,
   `browser_hover`, and `browser_keypress`.
5. Inspect layout with `browser_check_structure` on the element that looks wrong, and
   `browser_resize` to test other viewport widths.
6. `browser_screenshot` only when you need a visual record; prefer text tools to save tokens.

## Reporting

Report findings in this order: the repro steps, the observed behavior, the likely cause, and
a concrete fix. When you edit source files, keep the change minimal and re-run the repro with
the browser tools to confirm the fix.

Never invent console output or network responses. Only report what the tools returned.
