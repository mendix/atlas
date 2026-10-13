# Atlas plan, phase 3: replace the Bootstrap file with Atlas-owned styles

Part of [Moving Atlas Core fully to CSS variables](atlas-plans.md). Status: plan only, nothing implemented. Written 2026-10-13.

Target: the adoption work ships in Atlas Core 4.x without changing anything for users. The default flips in 5.0.0 (phase 6 of the main plan). The files are deleted one major later.

The mxui file gets the same treatment in [phase 4](atlas-plan-4.md). The two phases share the crawl and the equivalence check.

## Why

`web/core/_legacy/bootstrap/` holds the complete Bootstrap 3.3.4 (2015) with normalize.css 3.0.2.

| | |
| --- | --- |
| `_bootstrap.scss` | 5,683 lines |
| `_bootstrap-rtl.scss` | 1,736 lines |
| Share of the compiled Atlas Core CSS | about 166 KB of 659 KB, 25% |
| Values | Hardcoded colors and sizes, no CSS variables |
| Switch | `$exclude-bootstrap` exists, default `false`. With `true` the theme compiles (since 4.5.0) |

It is the last large block of styling that is not on tokens, and Atlas overrides much of it with its own rules.

## What the evidence says

Three checks were done on 2026-10-13.

### 1. Compiled CSS with and without Bootstrap

Compiled a scratch copy of the theme with `$exclude-bootstrap: true` and compared.

| Lost when Bootstrap is excluded today | Evidence |
| --- | --- |
| Global `* { box-sizing: border-box }` | No universal rule left |
| normalize and element resets | About 100 element rules |
| Glyphicon icon codes | 276 `glyphicon-*` rules, 1 left |
| `col-xs-1` to `col-xs-12` | 12 classes. The other `col-sm/md/lg-N` classes come from Atlas itself |
| Base declarations on classes Atlas only restyles | Roughly 450 declarations: button, form, dropdown, headings, pagination, modal, label, table, nav, badge, alert |

So Bootstrap cannot simply be switched off. Layouts do depend on it, mainly through the box-sizing reset, the element resets, and the base rules of the components.

### 2. The deployed reference app

Crawled https://atlasdesignsystem.mendixcloud.com/ in a browser: all 126 pages that have a URL, 43,865 DOM nodes, at a 1366 px viewport, as an anonymous user. For every Bootstrap rule in `theme.compiled.css`, tested whether its selector matches an element on any page.

| | Total | Matched on at least one page |
| --- | --- | --- |
| Bootstrap rules | 1,336 | 161 (12%) |
| Declarations in those rules, counted as longhand properties | 4,079 | 718 (18%) |
| Bootstrap class names | 751 | 94 present in the DOM |

Rules that matched, by group:

| Group | Rules that matched |
| --- | --- |
| Reset | `*`, `::before, ::after`, `html`, `body`, `a`, `b, strong`, `h1`, `img`, `svg`, `button, input, optgroup, select, textarea`, `table`, `td, th`, `p`, `ul, ol`, `label`, `input[type="radio"], input[type="checkbox"]`, `input[type="file"]`, `[role="button"]`, `[hidden]`. 43 element rules in total |
| Print | 8 rules in `@media print` |
| Typography | `h1` to `h6` and `.h1` to `.h6`, `.text-left`, `.text-right`, `.text-center`, `.text-nowrap`, `.text-lowercase`, `.text-uppercase`, `.text-capitalize`, `.text-primary`, `.text-success`, `.text-warning`, `.text-danger` |
| Glyphicons | `.glyphicon` and 17 icon codes |
| Images | `.img-rounded`, `.img-thumbnail`, `.img-circle` |
| Containers | `.container` with 3 breakpoints, `.container-fluid`, `.clearfix`, `.row` clearing |
| Tables | `.table`, `.table-bordered` |
| Forms | `.radio`, `.checkbox`, `.form-control-static`, `.has-error`, `.form-horizontal` label and radio rules, disabled states |
| Buttons | `.btn`, `.btn-lg`, `.btn-sm`, `.caret` |
| Dropdown | `.dropdown`, `.dropdown-menu` and its items |
| Tabs and nav | `.nav`, `.nav-tabs`, `.nav-pills`, `.tab-content` |
| Navbar | `.navbar`, `.navbar-nav`, `.navbar-default` |
| Components | `.breadcrumb`, `.label` and 4 variants, `.badge`, `.alert` and 3 variants |
| Helpers | `.hidden` |

Rules that never matched, 1,175 of them: carousel, panel, list group, media, well, jumbotron, thumbnail, input group, button group, pager, popover, embed, responsive `visible-*` utilities, and most variants of the groups above.

### 3. The model, read with mxcli

Scanned the class properties of all pages, layouts, snippets, building blocks, and page templates in `Atlas-Design-System` (4,186 class tokens). 28 Bootstrap classes are set by hand.

Set in the model and styled only by Bootstrap:

| Class | Uses |
| --- | --- |
| `alert-info` | 11 |
| `breadcrumb` | 10, in the Breadcrumb building blocks |
| `alert-warning`, `alert-danger` | 4 each |
| `center-block` | 2 |
| `glyphicon-chevron-down`, `btn-group-vertical` | 2 each, in WorkflowCommons snippets |
| `alert-success`, `btn-group` | 1 each |

Set in the model and also styled by Atlas: `alert` (31), `text-primary` (16), `text-center` (13), `text-danger` (6), `form-group` (6), `badge` (6), `navbar-brand` (4), `text-success` (4), `has-error` (4), `text-nowrap` (4), `control-label` (3), `btn`, `glyphicon`, `label-success`, `text-right` (2 each), `hidden-xs`, `label-primary`, `label-danger`, `disabled` (1 each).

The Atlas layouts themselves (`Atlas_Default`, `Atlas_SideBar`, `Atlas_TopBar`) set `navbar-brand` and their own `region-*` classes. Their dependency on Bootstrap is indirect: the box-sizing reset, the element resets, and `.navbar` and `.nav` base rules for the navigation widgets.

### Limits of the evidence

- The crawl saw pages in their resting state. Nothing was opened, hovered, or submitted. Rules for open pop-ups and dialogs (`.modal-*`), open dropdowns, tooltips, date picker pop-ups, validation messages, and pagination may be needed although they did not match.
- Only pages with a URL were visited: 126 of 277. The rest is reachable only through navigation or needs a logged-in role (Administration, WorkflowCommons, Feedback).
- One viewport, 1366 px. Phone and tablet profiles were not crawled.
- The deployed app runs Mendix 11.6 with an Atlas Core 4.x release, not the 4.6.0 branch.
- Right-to-left was not tested.
- The 1,336 rules include most of `_bootstrap-rtl.scss`, which can only match on right-to-left pages. The share of the left-to-right rules in use is therefore somewhat higher than 12%.
- One app. Customer apps may use Bootstrap classes that this app does not.

## Plan

### Step 1: write down what Atlas supports

A list of the Bootstrap class names that stay supported after the file is gone. Start from the groups in the table above, the model list, and every class that `design-properties.json` can set on a widget.

Cross-check with the Themis prototype. Its layout shell runs with Bootstrap excluded and re-implements only what it needed: `* { box-sizing }`, `img`, `.nav`, `.btn` and `.btn-lg`, `.caret`, `.open`, `.navbar-brand`. A class that is in both the crawl and Themis is certain. A class that is only in the crawl is one Themis misses today. This list is the contract; everything else is dropped.

Two groups need a decision, because the reference app does not use them but apps might: the responsive utilities (`visible-xs`, `hidden-sm`, and so on) and `pull-left`, `pull-right`.

### Step 2: adopt, in Atlas-owned files, on tokens

Work in slices, layout shell first:

1. Reset, layout shell, navigation. Reference: the Themis files `_base.scss`, `_navigation.scss`, `_scrollcontainer.scss`, `_sidebar.scss`, `_topbar.scss`. Milestone: the three Atlas layouts look the same with Bootstrap off.
2. Buttons, forms, tables.
3. The remaining built-in widgets.
4. Interaction states: pop-ups, dialogs, dropdowns.

Rules that only a pluggable widget needs (`.badge`, `.progress`, `.pagination`) are adopted in that widget's file, so they leave Atlas together with it in [phase 7](atlas-plan-7.md).

| From Bootstrap | To | Notes |
| --- | --- | --- |
| `*` box-sizing, normalize subset, element resets | new `core/base/_reset.scss` | Only the rules that matched, plus form control resets |
| Print rules | `core/base/_reset.scss` or a `_print.scss` | 8 rules |
| Headings, `.h1` to `.h6`, `.text-*` | `core/base/_typography.scss` | Colors from `--brand-*` |
| `.glyphicon` and all icon codes | `core/widgets/_glyphicon.scss` | Keep the full code table: Studio Pro lets an app pick any glyphicon. Already has `$exclude-glyphicon` |
| `col-xs-*`, `.container`, clearfix | `core/widgets/_layout-grid.scss` | |
| `.btn` base, sizes, `.caret` | `core/widgets/_button.scss` | |
| `.form-*`, `.radio`, `.checkbox`, `.has-error` | `core/widgets/_input.scss`, `_check-box.scss`, `_radio-button.scss` | Removes the three `@extend ... !optional` on Bootstrap classes |
| `.table`, `.table-bordered`, `-striped`, `-hover` | `core/widgets/_table.scss` | |
| `.dropdown`, `.dropdown-menu` | `core/widgets/_pop-up-menu.scss` or a new `_dropdown.scss` | |
| `.nav`, `.nav-tabs`, `.nav-pills`, `.tab-content` | `core/widgets/_tab-container.scss` | |
| `.navbar`, `.navbar-nav`, `.navbar-default` | `core/widgets/_navigation-bar.scss` | Colors from the `--bar-*` roles |
| `.label`, `.badge`, `.alert`, `.breadcrumb` | Their widget files; `alert-info` and `breadcrumb` need a home | |
| `.modal-*`, `.pagination`, `.progress`, `.close`, tooltips | Their widget files | Not seen in the crawl; check by interaction first (step 3) |
| `.img-rounded`, `.img-thumbnail`, `.img-circle`, `.hidden`, `.center-block`, `.btn-group` | `core/helpers/` | |
| `_bootstrap-rtl.scss` | Nothing: use logical properties in the adopted rules | Same approach as the label alignment fix in 4.5.0 |

Every adopted rule uses CSS variables. That makes this phase part of the CSS variables goal, not a side project.

During this step the adopted rules are emitted behind a new temporary switch, for example `$atlas-own-base`, default `false`. Nothing changes for anyone, including projects that already set `$exclude-bootstrap: true`, such as the Themis prototype. To test, set both: `$exclude-bootstrap: true` and the new switch `true`. In 5.0.0 the new switch disappears and the adopted rules are always emitted.

### Step 3: close the gaps in the evidence

Before trusting the "never matched" list:

1. Extend the crawl with interaction: open a pop-up and a dialog, open dropdowns and the date picker, trigger validation, page through a grid, hover a tooltip.
2. Crawl the phone and tablet profiles.
3. Visit the pages without a URL through the navigation, logged in as a demo user.
4. Run the same crawl against one or two real customer-style apps, if available.

The crawl is a script that runs in the browser against a running app. It can be kept in `packages/atlas/e2e` and rerun.

### Step 4: prove equivalence

With `$exclude-bootstrap: true`, the reference app must look the same as with `false`.

- Playwright screenshots in `packages/atlas/e2e`, both settings, all pages.
- Per supported class, compare the computed styles of matching elements between the two builds. Differences are either fixed or listed as intended.

Studio Pro compiles the theme; the check runs against a Mendix project built with `npm run build` in `packages/atlas-core`.

### Step 5: flip the default, in 5.0.0

Part of phase 6 of the main plan.

- `$exclude-bootstrap` becomes `true` by default.
- Release notes list the Bootstrap classes that are no longer styled.
- An app that needs the old file sets `$exclude-bootstrap: false` in `theme/web/exclusion-variables.scss`. This is the escape hatch for one major version.

### Step 6: delete the files, one major later

Remove `core/_legacy/bootstrap/`, the `bootstrap()` and `bootstrap-rtl()` includes in `main.scss`, and the `$exclude-bootstrap` switch. Delete the files in `Atlas-Design-System` too, because the release copies files but does not delete them.

## Expected gain

- A smaller theme: 166 KB of Bootstrap out, minus what is adopted. With 12% of the rules in use, the adopted part should be well under a quarter of that. Target for phases 3 and 4 together: from 659 KB to about 400 KB. Measure at each slice.
- No more rules that exist only to override Bootstrap.
- The last block of hardcoded colors and sizes is gone.

## Risks

| Risk | Mitigation |
| --- | --- |
| Apps use Bootstrap classes in class properties or custom HTML that Atlas no longer styles | Supported-class list in the release notes; escape hatch for one major |
| Marketplace and custom widgets rely on Bootstrap base rules | The crawl covers the platform widgets in the reference app; `web-widgets` sources reference `visible-xs/sm/md/lg`, `table-striped`, `table-hover`, `btn-group`, `alert-danger`, `tab-content`, `col-xs-2` |
| Small spacing and alignment shifts, because Atlas rules were written on top of Bootstrap's | Step 4 |
| States the crawl did not see | Step 3 |
| Right-to-left regressions | Logical properties, and an RTL pass in step 4 |
| The Dojo client (`$use-modern-client: false`) may need the file | Confirm that the Dojo client is no longer supported (phase 4, step 1) |

## Open decisions

| # | Question | Recommendation |
| --- | --- | --- |
| 1 | Responsive utilities (`visible-*`, `hidden-*`) and `pull-*`: supported or dropped? | Keep `hidden-*` and `pull-*`, which are common in apps. Decide `visible-*` with usage data |
| 2 | Keep all glyphicon codes? | Yes |
| 3 | Flip the default in 5.0.0, or a later major? | 5.0.0, together with the other breaking changes |
| 4 | Same treatment for `_mxui.scss`? | Yes. It is phase 4: [atlas-plan-4.md](atlas-plan-4.md) |
| 5 | Projects that already set `$exclude-bootstrap: true`: give them the adopted rules in 4.x, or hide those behind a new switch until 5.0.0? | New switch. Themis is a known project that excludes Bootstrap today |
