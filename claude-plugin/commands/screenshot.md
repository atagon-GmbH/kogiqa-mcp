---
description: Open a URL and take a screenshot to confirm the page renders
argument-hint: "[url]"
allowed-tools: mcp__plugin_kogiqa-browser_browser__browser_navigate, mcp__plugin_kogiqa-browser_browser__browser_screenshot, mcp__plugin_kogiqa-browser_browser__browser_get_page_title, mcp__plugin_kogiqa-browser_browser__browser_get_console_log
---

Navigate to `$1` in the kogiQA browser and take a screenshot. Report the page title and
describe what the screenshot shows in one or two sentences. If the page is blank or shows an
error, say so and include any messages from the console.
