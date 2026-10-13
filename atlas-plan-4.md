# Atlas plan, phase 4: replace the mxui file with Atlas-owned styles

Part of [Moving Atlas Core fully to CSS variables](atlas-plans.md). Status: plan only, nothing implemented. Written 2026-10-13.

Target: the adoption work ships in Atlas Core 4.x without changing anything for users. The default flips in 5.0.0 (phase 6 of the main plan). The file is deleted one major later.

This phase follows the same method as [phase 3 for Bootstrap](atlas-plan-3.md) and can share its crawl and its equivalence check.

## What the file is

`web/core/_legacy/_mxui.scss` is the base stylesheet of the old Dojo client. It was shipped with the client; Atlas carries a copy.

| | |
| --- | --- |
| Size | 3,375 lines, 75 KB of the 659 KB compiled CSS, 11% |
| Rules | 607: 403 for Dojo widgets (`dijit*`, `dj_*`, `dojoDnd*`), 204 for Mendix classes (`mx-*`) |
| Values | Hardcoded, no CSS variables |
| Switch | `$exclude-mxui`, default `false` |
| With the switch set to `true` | Since 4.5.0, `mxui-core()` is emitted instead: three rules for page height and touch scrolling |

## The question: is `mxui-core()` enough to remove the file?

No. Measured on 2026-10-13 on the deployed reference app, https://atlasdesignsystem.mendixcloud.com/, 126 pages, 1366 px viewport, anonymous user.

### Test 1: which rules match the live pages

| | Rules | Matched on at least one page |
| --- | --- | --- |
| Dojo | 403 | 0. No Dojo class exists anywhere in the DOM |
| `mx-*` and the few element rules | 204 | 46, with 197 declarations |
| Kept by `mxui-core()` | | 3 of those 46 |

### Test 2: remove the file, keep only the `mxui-core()` rules

The mxui rules were deleted in the browser on each page, except the three of `mxui-core()`. The computed styles of every element were compared before and after.

| | |
| --- | --- |
| Pages that change | 125 of 126 |
| Elements that change | 5,669 of 38,301, 15% |

Most elements change through inheritance from a few rules:

| Rule lost | Effect |
| --- | --- |
| `.mx-text { white-space: pre-line }` | Line breaks in text widgets collapse. The largest effect by far: about 2,800 elements |
| `.mx-navigationtree ul`, `.mx-listview > ul` | Bullets and default padding come back on navigation trees and list views: about 2,700 elements |
| `.mx-link { display: inline-block }` | Link buttons become inline |
| `.mx-header`, `.mx-header-center`, `-left`, `-right` | The phone and tablet header loses its positioning and colors |
| `.mx-textarea textarea` | Resizes in both directions instead of vertically |
| `.mx-table th, .mx-table td` | Vertical alignment changes |
| `.mx-groupbox-*`, `.mx-checkbox`, `.mx-radiobuttons`, `.mx-tabcontainer-*`, `.mx-navigationlist`, `.mx-menubar`, `.mx-title` | Smaller shifts |

### Not seen at rest, probably needed

58 `mx-*` classes are styled only in `_mxui.scss`. The crawl opened nothing, so rules for these did not match, but the React client uses several of them:

- Pop-ups and dialogs: `mx-window-active`, `mx-window-content`, `mx-window-header`, `mx-dialog-body`, `mx-dialog-header`, `mx-resizer-*`
- Loading: `mx-progress-empty`, `mx-progress-hidden`, `mx-content-loader`, `mx-content-loading`, `mx-listview-loading`
- Other: `mx-tooltip-prepare`, `mx-offscreen`, `mx-reload-notification`, `mx-dropdown`, `mx-dropdown-list`, `mx-calendar-month-spacer`, `mx-imagezoom-*`, `mx-master-detail-*`, `mx-listview-selectable`, `mx-listview-clickable`, `mx-right-aligned`, `mx-center-aligned`
- Likely dead with the old data grid and report widgets: `mx-datagrid-*`, `mx-grid-*`, `mx-templategrid-empty`, `mx-reportmatrix`, `mx-ie-event-shield`

### Limits of the evidence

Same as in phase 3: pages at rest only, 126 of 277 pages, one viewport, anonymous user, one app, and the deployed app runs Mendix 11.6 with an older Atlas Core 4.x.

## Plan

### Step 1: confirm that the Dojo client is gone

The 403 Dojo rules match nothing in the React client. They can be deleted outright if no supported Mendix version can still run the Dojo client.

- Evidence so far: Studio Pro writes `$use-modern-client: true` into `_generated-exclusion-variables.scss` for an 11.0 project.
- To confirm with the client team: is the React client the only client from Mendix 11.0, the minimum version of Atlas Core?

If yes, three things go together:

| Remove | Where |
| --- | --- |
| The Dojo rules | `core/_legacy/_mxui.scss`, 403 rules |
| Dojo widget styles | `core/widgetscustom/_dijit-widget.scss` |
| The `$use-modern-client` branches | `layouts/_layout-atlas.scss` (2), `layouts/_layout-atlas-responsive.scss` (3), `main.scss` (1). Keep the modern-client side of each |

`$use-modern-client` then has no reader left in Atlas. Studio Pro still generates the file that sets it, so the variable must remain harmless if defined.

This step alone removes two thirds of the file and needs no adoption work.

### Step 2: sort the 204 `mx-*` rules

| Bucket | What | Action |
| --- | --- | --- |
| In use | The 46 rules that matched | Adopt in step 3 |
| In use, not seen at rest | Pop-up, dialog, loading, tooltip, and the other classes listed above | Confirm with the interaction crawl of phase 3, step 3, then adopt |
| Old widgets | Data grid 1, template grid, report widgets, Internet Explorer workarounds | Confirm they no longer render in the React client, then drop |

### Step 3: adopt, in Atlas-owned files, on tokens

Same slices as in phase 3: layout shell and navigation first (`.mx-navigationtree`, `.mx-navbar-item`, `.mx-button`, `.mx-link`, which the Themis prototype re-implements), then forms and tables, then the remaining built-in widgets, then pop-ups and dialogs. Rules that belong to a pluggable widget go to that widget's file and leave with it in [phase 7](atlas-plan-7.md).

| From `_mxui.scss` | To |
| --- | --- |
| `html, body, #content, #root`, `#content > .mx-page`, touch scrolling (the `mxui-core()` rules) | `core/base/_reset.scss`, created in phase 3 |
| `.mx-text`, `.mx-title` | `core/base/_typography.scss` |
| `.mx-link`, `.mx-button` base | `core/widgets/_button.scss` |
| `.mx-navigationtree *` | `core/widgets/_navigation-tree.scss` |
| `.mx-navigationlist *` | `core/widgets/_navigation-list.scss` |
| `.mx-menubar` | `core/widgets/_simple-menu-bar.scss` |
| `.mx-listview *` | `core/widgets/_list-view.scss` |
| `.mx-groupbox-*` | `core/widgets/_group-box.scss` |
| `.mx-header*` | `core/widgets/_header.scss` |
| `.mx-tabcontainer-*` | `core/widgets/_tab-container.scss` |
| `.mx-table` | `core/widgets/_table.scss` |
| `.mx-checkbox`, `.mx-radiobuttons`, `.mx-textarea` | `core/widgets/_check-box.scss`, `_radio-button.scss`, `_input.scss` |
| `.mx-window-*`, `.mx-dialog-*`, `.mx-resizer-*` | `core/widgets/_modal.scss` |
| `.mx-progress-*`, loading classes | `core/widgets/_progress.scss` |
| `.mx-scrollcontainer-*` (check what the file still holds) | `core/widgets/_scroll-container.scss` |

Rules for adopting:

- Every value comes from a CSS variable.
- Where Atlas already overrides a property, keep the Atlas value and drop the mxui one. The equivalence check shows whether that was right.
- The adopted rules are emitted behind the same temporary switch as in phase 3, default `false`, so projects that already set `$exclude-mxui: true` see no change.
- `mxui-core()` is removed at the end of this step: its three rules live in the reset file.

### Step 4: prove equivalence

With `$exclude-mxui: true`, the reference app must look the same as with `false`.

- Rerun test 2 of this document against a build with the adopted rules. The target is zero changed elements, or a short list of intended differences.
- Playwright screenshots in `packages/atlas/e2e`, both settings.
- Include the interaction states and the phone and tablet profiles.

Studio Pro compiles the theme; the check runs against a Mendix project built with `npm run build` in `packages/atlas-core`.

### Step 5: flip the default, in 5.0.0

Part of phase 6 of the main plan. `$exclude-mxui` becomes `true` by default. An app that needs the old file sets it back to `false`; that is the escape hatch for one major version.

### Step 6: delete the file, one major later

Remove `core/_legacy/_mxui.scss`, `core/_legacy/_mxui-core.scss`, the includes in `main.scss`, and the `$exclude-mxui` switch. Delete the files in `Atlas-Design-System` too, because the release copies files but does not delete them.

## Order with phase 3

Bootstrap and mxui are both loaded before the Atlas rules, and both are overridden by them. The equivalence check is the same tool for both. Suggested order:

1. Phase 4, step 1 (delete the Dojo rules). It is independent and safe once confirmed.
2. Phase 3 and phase 4 adoption in the same widget files, one widget at a time, so each file is touched once.
3. One shared equivalence run with both switches set to `true`.

## Expected gain

- 75 KB of compiled CSS out, minus the adopted `mx-*` rules. With 46 of 607 rules in use, the adopted part is small. Not measured.
- No Dojo code left in Atlas.
- `mxui-core()`, added in 4.5.0 as a workaround, is no longer needed.

## Risks

| Risk | Mitigation |
| --- | --- |
| A Mendix version still supported by Atlas can run the Dojo client | Step 1 is a hard gate |
| `mx-*` rules for states the crawl did not see are dropped by mistake | Interaction crawl before sorting; escape hatch for one major |
| Custom or Marketplace widgets built on Dojo (`dijit`) in customer apps | They would already be broken in the React client; mention in the release notes |
| Apps that style on top of mxui rules, for example `.mx-window` | The adopted rules keep the same selectors, so custom overrides still apply |
| Atlas and mxui both set a property with different values, and the wrong one is kept | Step 4 |

## Open decisions

| # | Question | Recommendation |
| --- | --- | --- |
| 1 | Is the React client the only client from Mendix 11.0? | To confirm with the client team. Gate for step 1 |
| 2 | Delete the Dojo rules already in 4.x, or wait for 5.0.0? | In 4.x, if decision 1 is yes: nothing can match them |
| 3 | Old widget classes (`mx-datagrid-*`, `mx-grid-*`, `mx-reportmatrix`): drop without adoption? | Yes, after confirming they do not render in the React client |
| 4 | Run the adoption together with phase 3, widget by widget? | Yes |
