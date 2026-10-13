# Atlas plan, phase 1: clean the core

Part of [Moving Atlas Core fully to CSS variables](atlas-plans.md). Status: plan only, nothing implemented. Written 2026-10-13 from the source on branch `atlas-core/neutral-theme`.

Target release: the next minor after 4.6.0, because item 2 adds theme variables. Item 1 alone could go into a patch. Scope: `packages/atlas/src/themesource/atlas_core/web/`. No model changes, nothing in `Atlas-Design-System`.

## Summary

| Item | What | Files |
| --- | --- | --- |
| 1 | Remove Sass fallbacks from `var(--x, $x)` | 2 |
| 2 | Replace hardcoded colors with tokens | 27, plus new tokens in `_theme-default.scss` |
| 3 | Collect the Sass that stays in one `_config.scss` | 1 new, 2 edited |
| 4 | Guard script for development | 1 new script |

Expected total: about 32 files touched, one new SCSS file, one script, one changelog entry.

## Item 1: remove Sass fallbacks

Pattern: `var(--x, $x)` becomes `var(--x)`.

**`core/widgets/_modal.scss`**, 16 lines:

| CSS variable | Uses |
| --- | --- |
| `--modal-header-border-color` | 3 |
| `--bg-color-secondary` | 3 |
| `--modal-header-color` | 2 |
| `--border-width-default`, `--modal-header-bg`, `--modal-body-bg`, `--modal-footer-bg`, `--font-weight-header`, `--font-weight-normal`, `--brand-primary`, `--dataview-controls-alignment`, `--brand-primary-200` | 1 each |

All of these are defined in `themes/_theme-default.scss`, except `--brand-primary-200`, which `_color-variants.scss` generates. The fallbacks are never used.

**`layouts/_layout-atlas.scss`**, 2 lines: `var(--brand-logo-height, $brand-logo-height)` and `var(--brand-logo-width, $brand-logo-width)`. The `$brand-logo` switch around them stays.

Expected output: the compiled CSS loses the fallback values. Rendering is identical.

## Item 2: replace hardcoded colors

62 occurrences in 29 files (hex and `rgb()`/`rgba()`), outside `themes/` and `core/_legacy/`. 12 of them are left as is (see below), so about 50 change, in 27 files. The counts per group in the table are estimates and add up to more than that; recount per file when implementing.

| Group | Occurrences | Where | Replace with | New token |
| --- | --- | --- | --- | --- |
| White on a colored background (`#fff`, `#ffffff`) | about 17 | label, badge, tab container, progress bar, date picker, check box, group box, scroll container, responsive layout | `var(--font-color-contrast)` for text, `var(--color-base)` for surfaces | No |
| Grays (`#aaaaaa`, `#cccccc`, `#555555`, `#e8e8e8`, `#f9f9f9`) | about 12 | input, modal close button, list view, login, template grid, progress circle | `--gray-*` shades, `--font-color-detail`, `--border-color-default` | No |
| Shadows (`rgba(0,0,0,…)`, `rgba(194,196,201,…)`, `rgba(5,15,129,…)`) | about 13 | modal, list view, pop-up menu, date picker, header, navigation bar, simple menu bar, demo user switcher, helper classes | `var(--shadow-small)`, `-medium`, `-large` with `var(--shadow-color)` | Possibly `--shadow-popup` for the two-layer pop-up menu shadow |
| Rating stars (`#ffa611`, `#cccccc`, `#ced0d3`) | 5 | `core/widgets/_rating.scss` | Leave. Pluggable widget, moves out in phase 7 | No |
| Switch (`$default-android-color`, `$default-ios-color`) | 2 | `core/widgets/_switch.scss` | Leave. Pluggable widget, moves out in phase 7 | No |
| Progress bar stripes (`rgba(255,255,255,0.15)`) | 3 | `core/widgets/_progress-bar.scss` | Leave. Pluggable widget, moves out in phase 7 | No |
| Barcode scanner (`#000000`, overlay, `#ffffff` corners) | 3 | `core/widgets/_barcode-scanner.scss` | Leave. Pluggable widget, moves out in phase 7 | No |
| Demo user switcher (`rgba(255,255,255,0.8)` and shadows) | 3 | `core/widgets/_demo-user-switcher.scss` | Values based on `--bar-primary-*` | No |
| Base (`#0a1325`) | 1 | `core/base/_base.scss` line 109 | Check what it styles first | Unknown |

Pluggable widget files are left alone in this phase. Their styling moves to the widgets in [phase 7](atlas-plan-7.md), and the hardcoded colors are fixed there. That also covers the white text in the badge and progress bar files. Do not add Atlas tokens for them.

Left as is:

- `core/widgetscustom/_dijit-widget.scss`, 11 occurrences. Dojo client only; phase 4 removes the file.
- The `ripple()` mixin default `#000` in `core/base/mixins/_animations.scss`. It is a mixin parameter.

Local Sass values to convert in the same pass: `$height-row-s`, `$height-row-m`, `$height-row-l` in `core/helpers/_table.scss`, to `--table-row-height-s`, `-m`, `-l`.

New tokens in `_theme-default.scss`: about 3 to 5, for the table row heights and possibly a pop-up shadow.

## Item 3: one `_config.scss`

- Move from the bottom of `themes/_theme-default.scss`: `$brand-logo`, `$font-family-import`, `$form-input-style`, `$btn-bordered`, `$important-flex`, `$important-spacing`, `$important-helpers`.
- `_theme-default.scss` then holds CSS variables only.
- `main.scss` gets one extra `@import "config"`. It must come before `theme/web/custom-variables`: the variables are `!default`, so the app's values only win when the import order stays as it is now.
- `_breakpoints.scss` and `_exclusion-variables-defaults.scss` stay as separate files. `_config.scss` names them in a comment as the Sass that is allowed.

## Item 4: guard script

A development aid, not a compile step. Studio Pro compiles the theme; CI in this repository is for development.

- A text check that fails on a value-type `$name` in `core/`, `layouts/`, or `themes/`, unless the name is on the allowlist: `exclude-*`, `important-*`, `screen-*`, `use-modern-client`, the four feature switches, and mixin or function parameters.
- The same script flags new hex or `rgb()` values outside `themes/` and `core/_legacy/`.
- Optional. If review is enough, skip it.

## Where "no behavior change" does not fully hold

1. **Grays and shadows in the default theme.** Values like `#aaaaaa` or `rgba(194,196,201,0.30)` have no exact token. Either accept small visual shifts and update the screenshots, or add tokens that carry the exact old value. Decision needed.
2. **Customized themes change, on purpose.** Text that is hardcoded white today will follow `--font-color-contrast`. A dark theme gets correct colors where it had wrong ones. This is visible, so it belongs under `Changed` in the changelog.
3. **Legacy Sass themes** (`$use-css-variables: false`). Item 1 is safe, because the mapping still sets those CSS variables. The new tokens from item 2 have no Sass mapping, so they take the CSS defaults. That matches the phase 2 decision to stop adding mappings.

## Acceptance test: a dark variant

Hardcoded colors are invisible in the default theme and obvious in a dark one. The test for item 2:

- A theme variant can be written as one `:root.<class> { ... }` block that sets CSS variables, and nothing else.
- With that class on the root element, no built-in widget, layout, or helper shows a leftover light color.

The Themis prototype has such a block, `theme/web/_theme-dark.scss`. It is written with the region variables that 4.6.0 stopped setting (`--topbar-bg`, `--sidebar-bg`, `--navsidebar-*`), so rewrite it on the `--bar-*` roles before using it as the fixture.

## How to check

Studio Pro compiles the theme, so each change is checked in a Mendix project:

1. `npm run build` in `packages/atlas-core` with `MX_PROJECT_PATH` set to the project.
2. Run the app. An undefined Sass variable shows up as a theme compile error.
3. For item 2, compare the affected widgets before and after, and run the Playwright screenshots in `packages/atlas/e2e`.

## Pull requests, in order

1. Item 1: fallbacks in the modal and layout files.
2. Item 3: `_config.scss`.
3. Item 2, first part: replacements with an exact match (white, contrast).
4. Item 2, second part: grays, shadows, and the new tokens, with the screenshot update.
5. Item 4: the guard script, once the tree is clean.

## Open decisions

| # | Question |
| --- | --- |
| 1 | Grays and shadows: accept small shifts, or add tokens with the exact old values? |
| 2 | Token names for the table row heights: are the names above acceptable? |
| 3 | `#0a1325` in `_base.scss`: what does it style, and which token fits? |
| 4 | Guard script: wanted, or is review enough? |
