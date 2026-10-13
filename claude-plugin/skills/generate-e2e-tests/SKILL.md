---
name: generate-e2e-tests
description: Walk a flow in the browser and write end-to-end tests (Playwright, Cypress, etc.) that reproduce it. Use when asked to create e2e coverage for a user flow.
---

# Generate end-to-end tests

Drive the flow once in the browser to discover the real selectors and behavior, then write a
test that reproduces it.

## Workflow

1. `browser_navigate` to the start of the flow.
2. Walk each step with the browser tools. Record the URLs, the text/labels you interacted
   with, and the assertions that passed.
3. Use `browser_get_page_text` and `browser_list_page_inputs` to capture stable, user-facing
   selectors (labels, roles, placeholders) rather than brittle CSS paths.
4. Detect the framework already in the repo (look for `playwright.config.*`, `cypress.config.*`,
   or existing test folders) and match its conventions, file layout, and assertion style.
5. Write the test covering the happy path first, then add cases for validation errors and
   edge states you observed.

## Rules

- Match the existing test framework and naming conventions; do not add a new framework unless
  asked.
- Prefer role/label-based locators over positional ones.
- Run the new test if a test runner is configured, and report the result.
