---
description: Smoke-test a user flow at a URL and verify the expected result
argument-hint: "[url] [flow description]"
allowed-tools: mcp__plugin_kogiqa-browser_browser__browser_navigate, mcp__plugin_kogiqa-browser_browser__browser_click, mcp__plugin_kogiqa-browser_browser__browser_type, mcp__plugin_kogiqa-browser_browser__browser_has_text, mcp__plugin_kogiqa-browser_browser__browser_has_button, mcp__plugin_kogiqa-browser_browser__browser_get_page_text, mcp__plugin_kogiqa-browser_browser__browser_get_console_log
---

Smoke-test the flow in `$ARGUMENTS`.

Interpret the arguments as a URL followed by the flow to exercise. Walk each step in the
kogiQA browser, asserting state between steps with `browser_has_text` and
`browser_has_button`. Report each step as pass/fail with the evidence returned. Stop and
report clearly if a step fails. Finish with a check for console errors.
