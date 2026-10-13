---
name: exploratory-testing
description: Run time-boxed exploratory testing against a web app to find bugs and inconsistencies. Use when asked to poke at an app, stress its forms, or hunt for edge cases.
---

# Exploratory testing

Systematically explore an app for defects within a time box.

## Workflow

1. `browser_navigate` to the app and map its reachable pages with `browser_list_clickable`.
2. For every form you find (`browser_list_page_inputs`), try boundary and invalid inputs with
   `browser_type`: empty, very long, unicode, emoji, negative numbers, malformed emails, HTML
   and script fragments.
3. Exercise interactive controls: dropdowns (`browser_select`), uploads (`browser_upload_file`),
   drag targets (`browser_drag_from_to`), and keyboard shortcuts (`browser_keypress`).
4. After each action, check for a change in state with `browser_has_text`, and watch
   `browser_get_console_log` for errors.
5. Use `browser_fuzzing` for time-boxed randomized input only after the manual pass, and
   `browser_check_accessibility` for an accessibility sweep.

## Reporting

Produce a numbered list of findings. For each: the page, the exact steps, the observed vs.
expected behavior, and a severity (blocker / major / minor). Separate "looks broken" from
"looks inconsistent but intentional" and flag the latter as a question.
