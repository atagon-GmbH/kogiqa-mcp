---
name: smoke-test
description: Smoke-test a user flow end to end in a browser (login, checkout, signup, etc.) and verify the expected result. Use when asked to walk through a flow and confirm it still works.
---

# Smoke-test a user flow

Walk through a named user flow and verify the expected outcome.

## Workflow

1. Confirm the flow, the entry URL, and the expected end state with the user if anything is
   ambiguous.
2. `browser_navigate` to the entry URL.
3. `browser_get_page_title` and `browser_list_clickable` to orient yourself before acting.
4. Perform each step with `browser_type`, `browser_click`, `browser_select`, and
   `browser_keypress`. Use `browser_has_text`, `browser_has_button`, and `browser_has_input`
   to assert state between steps.
5. At the end, verify the expected result, for example `browser_get_page_text` or
   `browser_has_text` for a confirmation message.
6. `browser_get_console_log` once at the end to catch silent errors.

## Reporting

Report each step as pass/fail with the evidence the tool returned. If a step fails, stop and
report the failing step, what you expected, and what you saw. Do not silently skip steps.
