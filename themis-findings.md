# Themis layout shell: findings (WC-3573)

Spike: a separate module with a Topbar and a Sidebar layout that works with Atlas Core and without it. Written
2026-11-10. Code: `packages/atlas/src/themesource/themis/web`, build package `packages/themis`.

## Decision

Themis is a layout module. Atlas Core is its default styling module and can be replaced. Without a styling module the
layouts work but look plain. This changes the framing in [atlas-plans.md](atlas-plans.md), line 37 ("a prototype of
the layout shell on a trimmed core, not a second product"); update that line if this direction holds.

## Findings

### 1. The model depends on Atlas Core, not only the styles

The prototype layouts in `ThemisLayouts.mpr` (read with mxcli) use Atlas Core documents:

| Layout           | Atlas Core dependency                                                                                                                                                                                              |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `Themis.TopBar`  | snippet `Atlas_Core.FeedbackWidget`, snippet `Atlas_Core.LanguageSelectorWidget`, image `Atlas_Core.Layout.logo`, design properties Flex container / Item gap / Align items Y                                      |
| `Themis.SideBar` | snippet `Atlas_Core.FeedbackWidget`, snippet `Atlas_Core.LanguageSelectorWidget_Dark`, image `Atlas_Core.Layout.logo`, design properties Spacing / Flex container / Align items Y / Disable row wrap / Grow-shrink |

Removing Atlas Core from that project gives consistency errors before any styling question comes up. Themis already
has its own `LanguageSelectorWidget` and `LanguageSelectorWidget_Dark` snippets; the layouts do not use them.

The three sidebar toggle buttons also used Atlas Core icons (`Atlas_Core.Atlas_Filled.navigation-menu` and
`chevron-right`) and design properties (Spacing from Atlas Core; Size and Hide on from the prototype's own
`design-properties.json`). `DESCRIBE LAYOUT` does not show these; they surfaced in the raw model (`mxcli bson dump`).
mxcli cannot write toggle buttons, so those changes were done in Studio Pro (list at the end).

### 2. The layout structure itself lives in Atlas Core

The React client renders the scroll container regions but ships no CSS for them. Page flex, region sizes, sidebar
open/closed, push and slide are all in Atlas Core's `core/widgets/_scroll-container-react.scss`. Without Atlas Core
the regions do not lay out at all.

Themis therefore carries the subset its layouts use (`_scroll-container.scss`), scoped to `.layout-themis`: left
sidebar, top bar, content. With Atlas Core present the copied rules are the same as Atlas's. This is the one place
where Themis duplicates Atlas Core. It goes against "not taken from Themis: layout copies under `.layout-themis`" in
[atlas-plans.md](atlas-plans.md) (line 217); for a separate module there is no alternative.

### 3. Sass cannot cross the module boundary

The prototype's `main.scss` imports `../../../theme/web/custom-variables`, which is Atlas Core's theme file. Any use of
an Atlas Sass variable (`$screen-md`, `$spacing-*`) or mixin breaks the compile when Atlas Core is absent. Themis
compiles on its own (checked with `sass`, 11.5 KB) and writes the one breakpoint it needs, 768px, as a literal.

### 4. What the shell needed from Bootstrap and mxui

The rules Themis had to own because Atlas Core gets them from the legacy files:

| From                     | Rule                                                                 | Themis file                                                                       |
| ------------------------ | -------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| Bootstrap                | `* { box-sizing: border-box }`                                       | `_reset.scss`                                                                     |
| Bootstrap                | `body` font, size, line height, color, `margin: 0`                   | `_reset.scss`                                                                     |
| Bootstrap                | `img { vertical-align: middle }`                                     | `_reset.scss`                                                                     |
| Bootstrap                | `.nav { padding-left: 0; list-style: none }`                         | `_reset.scss`, as a list reset on `.mx-navbar ul.nav` and `.mx-navigationtree ul` |
| mxui (`_mxui-core.scss`) | `html, body, #content, #root { height: 100% }`, `.mx-page` full size | `_reset.scss`                                                                     |
| mxui                     | `.mx-navigationtree ul` list and nesting                             | `_navigation.scss`                                                                |
| Atlas Core widget        | Scroll container structure                                           | `_scroll-container.scss` (finding 2)                                              |

The prototype also re-implemented `.btn`, `.btn-lg`, `.caret`, `.open`, `a` colors, flex and spacing helpers and a
Poppins font. These are look, not structure, so they stay with the styling module. This list cross-checks phase 3,
step 1: the reset and `.nav` match the crawl. `.btn` and `.caret` are needed only for looks; `.navbar-brand` is structure (logo size and position).

### 5. Variable contract

Themis reads 41 CSS variables, all set by Atlas Core 4.6.0. The list is in
[packages/themis/README.md](packages/themis/README.md). A replacement styling module must set them. It uses the 4.6.0
bar roles (`--bar-primary-*`, `--bar-secondary-*`), so it needs Atlas Core 4.6.0 or later. The `atlas/themis` branch
was cut before 4.6.0 and must have main brought in.

## Results (2026-11-10)

ThemisLayouts (Mendix 11.12.2) with Atlas Core 4.6.0, run with `mxcli run --local --db-type hsqldb` and Studio Pro's
bundled mxbuild. Two test pages: `MyFirstModule.Themis_TopBar_Test` (`/p/themis-topbar`) and
`MyFirstModule.Themis_SideBar_Test` (`/p/themis-sidebar`). Playwright at 1366×768 and 375×812, desktop SideBar also
with the sidebar collapsed. Screenshots in `themis-screenshots/`, overview in `contact-sheet.png`.

| Setup                                                        | Compiled theme | Result                                                                                                                                                                                           |
| ------------------------------------------------------------ | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1. Atlas Core, legacy files on                               | 734 KB         | Layouts as intended: dark primary bar, white secondary top bar in SideBar, sidebar collapses to the 52px icon column, phone toggles only on phones                                               |
| 2. Atlas Core, `$exclude-bootstrap` and `$exclude-mxui` true | 493 KB         | Region sizes identical to 1. Only visible difference: the Home menu item's glyphicon is gone (glyphicons come from Bootstrap)                                                                    |
| 3. No Atlas Core styles                                      | 165 KB         | Works, not pretty: regions in place (sidebar 232px, content fills the rest, collapsed sidebar 0px), browser default fonts and colors, menu items without spacing, top bar as tall as its content |

`atlas-plans.md` (line 125) gives 338 KB for "the Themis setup": that is the prototype project, with Atlas Core in and
both legacy files and more excluded. Setup 3 has no Atlas Core styles at all.

The reset (`_reset.scss`) only applies on pages with a Themis layout, so pages on Atlas layouts in the same app do not
change. Pop-ups render outside the layout and get no Themis reset.

Setup 3 empties Atlas Core's and Atlas Web Content's `web/main.scss` instead of removing the modules: other modules
in the test project (Administration, Feedback, test pages) use Atlas Core layouts and would stop the build. Themis
itself has no Atlas Core references in the model: checked in the raw model of both layouts.

Found while testing:

-   Bootstrap's `.navbar-brand` (float, fixed height, padding) pulled the sidebar menu beside the logo when the legacy
    files are on. Themis now overrides float, height and padding on its brand.
-   The layout class sits on the `.mx-page` element itself, so `.mx-page:has(.layout-themis)` alone does not match it.
    Without Atlas Core this left the page at zero width.
-   Region Size does not reach CSS for a top region: the client sets `--sidebar-size` only on side regions. The top bar
    is 48px with Atlas Core (from `--topbar-minimalheight`) and as tall as its content without it.
-   A logo sized only by `--brand-logo-height` renders at its natural size without a styling module. Fixed in the model:
    both logo images are 32px wide, matching Atlas Core's `--brand-logo-width`.
-   The scroll container has `mx-scrollcontainer-fixed`, which sets `overflow: auto` on the sidebar. The edge toggle
    needs `overflow: visible` with `min-width: 0`, or the collapsed sidebar stays as wide as its labels.
-   Hiding the phone toggles was done with design properties ("Hide on"). They are now plain CSS on the class
    `themis-toggle-phone`.
-   On a phone, the SideBar sidebar starts open and squeezes the content to 143px: the toggle mode in the model is
    "shrink, initially open". Not changed in this spike.
-   Content has no padding: Atlas pads `.mx-layoutgrid`, and the test pages have no layout grid.
-   No conflict seen between Atlas Core's global navigation styles and Themis's.

## Open

-   Phone behaviour of the SideBar sidebar (see above). The toggle mode is one setting for all widths.
-   Toggle icons are images in `Themis.Layout` with a fixed grey: an image cannot follow the bar's text colour. A
    Themis icon collection or an SVG mask would.
-   Theme module order: Themis rules should come after Atlas Core's, so equal-specificity rules resolve to Themis. Check
    the order Studio Pro uses.
-   The app's navigation profile uses icons from `Atlas_Core.Atlas`. That is the app's dependency, not Themis's, but an
    app that drops Atlas Core must replace them.
-   Feedback widget and language selector: removed from the layouts. The prototype's Themis language selector snippets
    called Atlas Core flows and the `Atlas_Core.ReloadWithState` JavaScript action, so they were deleted with their
    nanoflow and microflow. Both are left to the app for now; owning them in Themis needs its own copy of the
    JavaScript action.

## Model changes in ThemisLayouts.mpr

The model is not in this repository; the Themis module package is attached to WC-3573. Done with mxcli `ALTER LAYOUT`
where possible, the rest in Studio Pro (marked SP).

Both layouts:

-   Layout class `layout-themis layout-themis-topbar` (TopBar) or `layout-themis layout-themis-sidebar` (SideBar).
-   `Atlas_Core.FeedbackWidget` and the language selector removed. The Themis language selector snippets, nanoflow
    and microflow deleted.
-   Image collection `Themis.Layout` with `logo`, `menu` and `chevron_right` (SP). Logo images point to it, 32px wide.
-   All design properties removed (containers and toggle buttons partly SP), replaced by classes:

| Layout  | Element          | Class                                                            |
| ------- | ---------------- | ---------------------------------------------------------------- |
| TopBar  | `container1`     | `themis-topbar-content`                                          |
| TopBar  | `container2`     | `themis-topbar-start`                                            |
| TopBar  | `container3`     | `navbar-brand`                                                   |
| TopBar  | `container5`     | `themis-topbar-end` (empty now)                                  |
| TopBar  | `sidebarToggle3` | `toggle-btn themis-toggle-phone`, icon `Themis.Layout.menu` (SP) |
| SideBar | `container4`     | `themis-topbar-content`                                          |
| SideBar | `container6`     | `themis-topbar-start`                                            |
| SideBar | `staticImage1`   | `navbar-brand`                                                   |
| SideBar | `sidebarToggle4` | `toggle-btn-sidebar`, icon `Themis.Layout.chevron_right` (SP)    |
| SideBar | `sidebarToggle6` | `toggle-btn themis-toggle-phone`, icon `Themis.Layout.menu` (SP) |

Test pages `MyFirstModule.Themis_TopBar_Test` and `MyFirstModule.Themis_SideBar_Test` added for the screenshots.
