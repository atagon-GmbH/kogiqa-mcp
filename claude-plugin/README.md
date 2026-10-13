# kogiQA Browser — Claude Code plugin

A Claude Code plugin that bundles the [kogiQA MCP server](../readme.md) (selector-free browser
automation) together with skills and slash commands for common QA and debugging tasks.

## What's inside

| Component | Path | What it does |
| :- | :- | :- |
| MCP server | `.mcp.json` | Runs `npx kogiqa-mcp@latest`, exposing 47 `browser_*` tools |
| Skill | `skills/browser-debug/` | Reproduce and diagnose style issues and console errors |
| Skill | `skills/smoke-test/` | Walk a user flow and verify the expected result |
| Skill | `skills/exploratory-testing/` | Time-boxed bug hunting across forms and controls |
| Skill | `skills/generate-e2e-tests/` | Discover a flow, then write matching e2e tests |
| Skill | `skills/map-app/` | Crawl and document an app's pages and features |
| Command | `commands/console-errors.md` | `/kogiqa-browser:console-errors [url]` |
| Command | `commands/smoke-test.md` | `/kogiqa-browser:smoke-test [url] [flow]` |
| Command | `commands/screenshot.md` | `/kogiqa-browser:screenshot [url]` |

The MCP server loads as `plugin:kogiqa-browser:browser`; its tools are named
`mcp__plugin_kogiqa-browser_browser__browser_*`.

## Requirements

- Node.js 20 or newer (the MCP server downloads its browser binary on first run).

## Install

From a session, add this folder as a plugin directory (no marketplace needed):

```bash
claude --plugin-dir ./claude-plugin
```

Then run `/reload-plugins` after edits, and `/mcp` to confirm the `browser` server is
connected.

To install permanently, list this directory in a marketplace, or put it under
`~/.claude/skills/kogiqa-browser/` so it auto-loads every session.

## Validate

```bash
claude plugin validate ./claude-plugin
```
