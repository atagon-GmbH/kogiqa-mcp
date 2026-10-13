---
description: Open a URL and collect all console errors and failed network requests
argument-hint: "[url]"
allowed-tools: mcp__plugin_kogiqa-browser_browser__browser_navigate, mcp__plugin_kogiqa-browser_browser__browser_get_console_log, mcp__plugin_kogiqa-browser_browser__browser_get_network_history, mcp__plugin_kogiqa-browser_browser__browser_click
---

Open `$1` in the kogiQA browser, wait for it to settle, then report every console error and
any failed network request (4xx/5xx or network error). Then click through the main navigation
links and collect the errors from each page as well.

For each error, give the page it occurred on, the message text, and your best guess at the
cause. Group duplicate messages together. If there are no errors, say so explicitly.
