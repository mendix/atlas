# Themis

A layout module: two layouts, `Themis.TopBar` and `Themis.SideBar`, with the styles that give them their structure.
Spike for WC-3573.

Themis has no dependency on Atlas Core. Atlas Core is its default styling module: with Atlas Core in the app, the
layouts follow the Atlas theme. Without it, they still work, with browser defaults for colors and fonts. An app can
replace Atlas Core with its own styling module, for example a copy of Atlas Core it changes, as long as that module
sets the variables below.

## What Themis owns

| File                         | What                                                                                                                                                                             |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `web/_reset.scss`            | `box-sizing`, full-height `html`/`body`/`#content`/`#root`, `body` font and colors, list reset for the navigation widgets. Only on pages with a Themis layout                    |
| `web/_scroll-container.scss` | Flex structure of the scroll container and its regions, sidebar open/closed, push and slide. Copied from Atlas Core's `_scroll-container-react.scss`, scoped to `.layout-themis` |
| `web/_layout.scss`           | Top bar and sidebar, bar roles, sidebar collapse toggle                                                                                                                          |
| `web/_navigation.scss`       | Menu bar in the top bar, navigation tree in the sidebar                                                                                                                          |

Rules:

-   `web/main.scss` compiles on its own. No Sass variables, mixins or functions from another module.
-   No values of its own for colors, spacing or fonts: everything is a CSS variable from the styling module.
-   No literal fallbacks on those variables. Unset means browser default. The one exception is `--closed-sidebar-width`, which Themis sets itself; its `0px` fallback is the closed width without a styling module.
-   Breakpoint 768px is written out, because media queries cannot read CSS variables.

## The contract with the styling module

Themis reads these CSS variables. A styling module that replaces Atlas Core sets them on `:root`.

| Group            | Variables                                                                                                                                                                                                                                    |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Bar roles        | `--bar-primary-bg`, `-bg-hover`, `-bg-active`, `-color`, `-color-hover`, `-color-active`, `-title-color`, `-edge`, and the same for `--bar-secondary-*`                                                                                      |
| Page             | `--bg-color`, `--color-base`, `--font-family-base`, `--font-size-default`, `--font-color-default`, `--line-height-base`, `--border-default`                                                                                                  |
| Brand            | `--brand-logo-height`, `--brand-logo-width`                                                                                                                                                                                                  |
| Spacing          | `--spacing-smaller`, `--spacing-small`, `--spacing-medium`                                                                                                                                                                                   |
| Top bar          | `--topbar-minimalheight`, `--navtopbar-font-size`, `--navtopbar-glyph-size`                                                                                                                                                                  |
| Sidebar          | `--navsidebar-width-closed`, `--navsidebar-toggle-size`, `--navsidebar-icon-height`, `--navsidebar-font-size`, `--navsidebar-sub-font-size`, `--navsidebar-glyph-size`, `--navsidebar-animation-duration`, `--navsidebar-animation-function` |
| Navigation items | `--navigation-item-padding`, `--navigation-border-radius`                                                                                                                                                                                    |

All of them are set by Atlas Core 4.6.0 in `themes/_theme-default.scss`.

Set by Themis itself: `--bar-bg`, `--bar-color` and the other `--bar-*` without a role (from the role of the region),
`--closed-sidebar-width`. Set by the Mendix client: `--sidebar-size`, `--toggleable-sidebar-width`.

## Layout classes

| Layout           | Class                                 | Primary bar                                | Secondary bar                                                 |
| ---------------- | ------------------------------------- | ------------------------------------------ | ------------------------------------------------------------- |
| `Themis.TopBar`  | `layout-themis layout-themis-topbar`  | top bar                                    | none; the sidebar is the phone menu and is hidden when closed |
| `Themis.SideBar` | `layout-themis layout-themis-sidebar` | sidebar, keeps its icon column when closed | top bar                                                       |

Inside the top bar: `themis-topbar-content` (wrapper), `themis-topbar-start`, `themis-topbar-end`, `navbar-brand`
(logo and app name), `toggle-btn themis-toggle-phone` (sidebar toggle, shown below 768px). In the sidebar:
`navbar-brand` (logo, 32px wide in the model), `toggle-btn-sidebar` (collapse toggle on the edge).

## Build into a Mendix project

```bash
cd packages/themis
MX_PROJECT_PATH=/absolute/path/to/project npm run build:module
```

This replaces `themesource/themis/web` in that project. Studio Pro compiles the theme.
