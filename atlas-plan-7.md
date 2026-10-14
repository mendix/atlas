# Atlas plan, phase 7: move pluggable widget styling out of Atlas Core

Part of [Moving Atlas Core fully to CSS variables](atlas-plans.md). Status: plan only, nothing implemented. Written 2026-10-13.

This is the last phase. It changes what Atlas Core is responsible for.

## Direction

Atlas Core styles the platform. A pluggable widget styles itself.

| Stays in Atlas Core | Moves out |
| --- | --- |
| Theme variables (tokens) and the reset | Styles of pluggable widgets, the ones delivered as `.mpk` from the Marketplace or from `web-widgets` |
| Layouts and navigation | Their color and size variants (the `helpers/` files for those widgets) |
| Helper classes: spacing, flex, typography, backgrounds | Their design properties |
| Styles of the widgets that are built into Studio Pro: scroll container, text box, text area, data view, list view, and so on | |

The Themis prototype follows this split: it has no widget styling of its own.

## What moves, measured in the source

Classified `core/widgets/`, `core/helpers/`, and `core/widgetscustom/` by the classes they style: `widget-*` for pluggable widgets, `mx-*` for built-in widgets.

### Pluggable: moves out

| Widget | Atlas files | Lines | Widget has its own styles in `web-widgets` |
| --- | --- | --- | --- |
| Accordion | `widgets/_accordion.scss`, `helpers/_accordion.scss` | 267 | Yes, 153 lines |
| Badge | `widgets/_badge.scss` | 50 | No |
| Badge Button | `widgets/_badge-button.scss`, `helpers/_badge-button.scss` | 131 | No |
| Checkbox Radio Selection | `widgets/_checkboxradiobutton.scss` | 21 | Yes, 68 lines |
| Combo Box | `widgets/_combobox.scss` | 35 | Yes, 463 lines, already on 19 Atlas CSS variables |
| Pagination (List View Controls) | `widgets/_pagination.scss` | 76 | Not in `web-widgets`. The class `.widget-pagination` is rendered by the Pagination widget of the List View Controls package. It is not the pagination of Data Grid 2 or Gallery, which Data Widgets styles itself (`.pagination-bar`). Owner to be found |
| Progress Bar | `widgets/_progress-bar.scss`, `helpers/_progress-bar.scss` | 139 | No |
| Progress Circle | `widgets/_progress-circle.scss`, `helpers/_progress-circle.scss` | 128 | No |
| Range Slider | `widgets/_range-slider.scss`, `helpers/_range-slider.scss` | 54 | Yes, 20 lines |
| Slider | `widgets/_slider.scss`, `helpers/_slider.scss`, `helpers/_slider-color-variant.scss` | 83 | Yes, 20 lines |
| Rating | `widgets/_rating.scss`, `helpers/_rating.scss` | 102 | Yes, 124 lines |
| Switch | `widgets/_switch.scss` | 67 | Yes, 197 lines |
| Tooltip | `widgets/_tooltip.scss` | 15 | Yes, 65 lines |
| Timeline | `widgets/_timeline.scss` | 139 | Yes, 120 lines |
| Barcode Scanner | `widgets/_barcode-scanner.scss` | 61 | Yes, 143 lines |
| Pop-up Menu | `widgets/_pop-up-menu.scss` | 130 | Yes, 11 lines |

About 1,500 lines in 24 files.

Not part of this list: Data Widgets. Checked on 2026-10-13 while implementing its OpenSpec change: Atlas Core styles none of its widgets. The one `.widget-dropdown-filter` rule in `widgets/_input.scss` sits under `.dj_webkit.dj_ios`, body classes of the Dojo client, and only cancels another Atlas rule; it goes away with the Dojo rules in phase 4.

Design properties: 12 of the 33 keys in `design-properties.json` are pluggable widget IDs: Badge, Progress Bar, Badge Button, Progress Circle, Switch, Star Rating, Accordion, Image, Slider, Tooltip, Range Slider, Combo Box.

### Built-in: stays

`_button`, `_check-box`, `_radio-button`, `_input` (text box, text area, drop-down, reference selector), `_label`, `_date-picker`, `_data-view`, `_list-view`, `_template-grid`, `_table`, `_layout-grid`, `_group-box`, `_tab-container`, `_scroll-container*`, `_div-container`, `_header`, `_modal`, `_progress` (the loading indicator), `_navigation-bar`, `_navigation-list`, `_navigation-tree`, `_simple-menu-bar`, `_typography`, `_glyphicon`, `_demo-user-switcher`, and the `helpers/` files that belong to them.

### To check

| File | Question |
| --- | --- |
| `widgets/_data-grid.scss`, `widgets/_grid.scss`, `helpers/_data-grid.scss` | They style the old built-in data grid (`mx-datagrid`, `mx-grid`). Does it still render in the React client? If not, they are dead; if yes, they stay |
| `helpers/_image.scss` | The Image widget is pluggable (it has design properties under its widget ID), but the built-in image viewers use the same helper classes |
| `widgets/_scroll-container-dojo.scss`, `widgetscustom/_dijit-widget.scss` | Removed in phase 4 with the Dojo client |
| `helpers/_badge-button.scss`, `helpers/_label.scss` | `.badge`, `.label-*`, `.btn-*` are generic classes that apps also set by hand (see the model scan in phase 3). The widget part moves; the generic classes stay |

## The constraint: where design properties live

A widget `.mpk` can carry CSS, but design properties are read from a module's `themesource/<module>/web/design-properties.json`. So a widget that wants design properties needs a module, as Data Widgets has (`themesource/datawidgets`).

Options for the 12 widgets:

| Option | How | Trade-off |
| --- | --- | --- |
| A | One module per widget, like Data Widgets | Clean ownership; many small modules to install |
| B | One companion module for all widget styling and design properties | One install; a new shared thing to version against every widget |
| C | Variants become widget properties instead of design properties | No module needed; a breaking change per widget, and existing pages lose their settings |
| D | Design properties stay in Atlas Core, styles move | Smallest change; Atlas keeps knowing about widgets it does not style |

This decides the shape of the phase and is open.

## Plan

### Step 1: the widgets take over their styles

In `web-widgets`, per widget:

1. Move the Atlas rules for the widget into the widget's own styles, written on Atlas CSS variables with literal fallbacks, so the widget also looks right without Atlas.
2. Move the variants (`helpers/`) the same way, or as decided for the design properties.
3. Release the widget. It must look the same with Atlas 4 and Atlas 5 installed: the Atlas rules are still there and now duplicate the widget's own.

Widgets without any styles of their own today (Badge, Badge Button, Progress Bar, Progress Circle) depend fully on Atlas and need the most work.

This step joins phase 5, which already touches the same widgets in `web-widgets` to remove Sass fallbacks. Do both in one pass per widget.

### Step 2: switch the Atlas rules off by default

Atlas already has one switch per widget: `$exclude-accordion`, `$exclude-badge`, `$exclude-rating`, and so on, with `-helpers` variants. In a major version their defaults become `true`.

- Release notes name the minimum version of each widget that carries its own styles.
- An app with older widgets sets the switch back to `false`. That is the escape hatch for one major version.
- Projects that already set a switch to `true` are not affected.

### Step 3: delete the files, one major later

Remove the 24 files, their includes in `main.scss`, the switches, and the 12 keys in `design-properties.json` (unless option D). Delete the files in `Atlas-Design-System` too, because the release copies files but does not delete them.

## What this changes in the earlier phases

| Phase | Change |
| --- | --- |
| 1 | No new Atlas tokens for widgets that move out. `--rating-color`, `--switch-*`, `--barcode-scanner-*` are dropped from the plan; those hardcoded colors are fixed in the widget's own styles in step 1 |
| 3 | Bootstrap rules that only pluggable widgets need (`.badge`, `.progress`, `.pagination`) are adopted in the widget's files, so they move out together |
| 4 | Same for mxui rules, if any turn out to belong to a pluggable widget |
| 5 | Merged with step 1 of this phase |

## Order and version

- Step 1 can start any time. It changes nothing for users.
- Step 2 is a breaking change and needs a major version. It can be 5.0.0 if step 1 is finished for all widgets by then; otherwise it is the major after.
- An unfinished widget does not block the others: the switches are per widget.

## Risks

| Risk | Mitigation |
| --- | --- |
| An app upgrades Atlas but not its widgets: widgets lose their styling | Minimum widget versions in the release notes; switches as escape hatch |
| An app upgrades widgets but not Atlas: rules exist twice | Step 1 requires the same result with and without the Atlas rules |
| Widgets from other vendors that rely on Atlas rules for `widget-*` classes | Atlas only styles the Mendix widgets listed above; unaffected |
| Design properties disappear from pages when their definition moves | Keep the same names and classes, whichever option is chosen |
| Apps that override Atlas widget rules in their own theme | The widget rules keep the same selectors |

## Open decisions

| # | Question | Recommendation |
| --- | --- | --- |
| 1 | Where do widget design properties live (options A to D)? | Open. Decide first; it shapes everything else |
| 2 | Does step 2 go into 5.0.0? | Only if step 1 is done for all 16 widgets |
| 3 | The old built-in data grid files: dead or needed? | Confirm with the client team, together with the Dojo question of phase 4 |
| 4 | Generic classes that widgets share with app authors (`.badge`, `.label-*`): stay in Atlas? | Yes |
| 5 | Who owns the widget work in `web-widgets`? | Open |
| 6 | Who owns List View Controls, whose Pagination widget Atlas styles? Is it still supported? | Open. If it is not, `widgets/_pagination.scss` is dropped instead of moved |
