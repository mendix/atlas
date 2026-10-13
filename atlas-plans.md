# Atlas plans

## Moving Atlas Core fully to CSS variables

Status: plan only, nothing implemented. Written 2026-10-13, after the Atlas Neutral theme change (Atlas Core 4.6.0, PR #348). Revised the same day: the removal is a major version with loud breaking changes, and Atlas 4 is treated as the migration mode.

### Goal

All styling values in Atlas come from CSS variables. Sass variables remain only for switching features on or off and for build-time logic.

Sass that stays:

- `$exclude-*` (exclusion variables). `$exclude-bootstrap` and `$exclude-mxui` are temporary: they go away with their files
- `$important-*` (helper class importance)
- `$use-modern-client`, until phase 4 removes its last readers
- `$screen-*` breakpoints, because media queries cannot read CSS variables
- Feature switches: `$brand-logo`, `$font-family-import`, `$form-input-style`, `$btn-bordered`
- Mixin and function parameters

Sass that goes: every variable that holds a color, size, font, spacing, border, or shadow value.

### Approach

- **Atlas 4 is the migration mode.** `_css-variables-mappings.scss` maps the Sass variables of a theme to CSS variables, so a Sass theme keeps working while its owner migrates. That is what Atlas 4 offers until its last release. Nothing more is built on top of it.
- **Atlas 5 has one mode.** `$use-css-variables` is removed, as if it were always `true`. The mappings are removed. A theme that still sets Sass values does not silently change its look: the theme fails to compile with a message that says what to change.
- The breaking changes are listed in the changelog and the release notes of 5.0.0.

### Decisions made

| Decision | Outcome |
| --- | --- |
| Remove `$use-css-variables` and `legacy-variables()` | Yes, in a major version (5.0.0) |
| Silent or loud | Loud: compile errors with instructions, not a silent change of look |
| Role of the mappings in Atlas 4 | Migration mode. Kept as is until 5.0.0, then deleted |
| Sass compilation in CI | No. Studio Pro compiles the theme; CI in this repository is for development |
| What Atlas Core is responsible for | Tokens, reset, layouts, navigation, helper classes, and the widgets built into Studio Pro (scroll container, text area, and so on). Styling of pluggable widgets moves out, in the last phase |
| Themis | A prototype of the layout shell on a trimmed core, not a second product. It is input for phases 1, 3, and 4 |

### Where Atlas stands now

Measured on branch `atlas-core/neutral-theme` of `atlas`, on `web-widgets`, and on the modules installed in `Atlas-Design-System`.

| Area | State |
| --- | --- |
| Core styles (`web/core/`, `web/layouts/`) | 99 SCSS files. 34 use Sass variables, almost all for logic: `$exclude-*`, `$important-*`, `$use-modern-client`, `$screen-*`, mixin parameters |
| Value-type Sass left in core | `core/widgets/_modal.scss` (16 uses of `var(--x, $fallback)`), `layouts/_layout-atlas.scss` (`$brand-logo-width`, `$brand-logo-height`), and 62 hardcoded colors in 29 files |
| `web/themes/_theme-default.scss` | 407 CSS variables. This is the source of truth |
| `web/_variables.scss` | 398 Sass defaults: 99 literals, 171 derived from other Sass variables, 111 through `get-color-value()`. Values are still Atlas 4: `#264ae5`, Poppins |
| `web/_css-variables-mappings.scss` | 391 mappings from Sass variables to CSS variables. Emitted when `$use-css-variables` is false, and false is the default |
| `$use-css-variables` | Used in three places: `_variables.scss` lines 9 and 45, `main.scss` line 12. The app template sets it to `true` in `theme/web/custom-variables.scss` |
| Color shades (`_color-variants.scss`) | Already generated with `color-mix()` on CSS variables |
| `web/core/_legacy/_mxui.scss` | Base stylesheet of the old Dojo client, 3,375 lines, about 75 KB of the compiled CSS. 403 of its 607 rules style Dojo widgets. `$exclude-mxui` exists, default `false`; `true` emits the three rules of `mxui-core()` |
| `web/core/_legacy/bootstrap/` | Complete Bootstrap 3.3.4 with normalize.css, 7,400 lines, about 166 KB of the 659 KB compiled CSS, hardcoded values. `$exclude-bootstrap` exists, default `false` |
| Data Widgets module (`web-widgets/packages/modules/data-widgets`) | Its own `variables.scss` with 39 Sass variables, 18 hardcoded hex colors, 133 uses of `var(--x, $fallback)`, and 3 Sass color functions applied to Sass variables |
| Other widgets in `web-widgets` | Atlas-named Sass variables in `carousel-web`, `timeline-web`, `rich-text-web`, `datagrid-web`, `calendar-web`, `accordion-web` |
| Marketplace modules that use Atlas Sass names | WorkflowCommons (33 uses, imports `atlas_core/web/variables` by path), Feedback module (35 uses). Neither applies Sass color functions to them. Feedback does Sass arithmetic on them (`$spacing-small * 2`), which breaks once the names are CSS variable references. WorkflowCommons only uses them inside `calc()`, which keeps working |

Not measured:

- Third-party and customer modules that use Atlas Sass variables.
- How many apps on Mendix 11 still have a Sass theme.
- Whether Studio Pro shows Sass `@warn` output to the user.

### Constraints found in the source

1. **`_variables.scss` cannot be moved or deleted.** Every app imports it from `theme/web/custom-variables.scss` (`@import "../../themesource/atlas_core/web/variables"`), and WorkflowCommons imports it by path. Removing it breaks theme compilation in every app.
2. **Migration mode is a switch, not a gradual path.** With the flag unset or `false`, the mappings are emitted after the theme's own `:root` block and override it: a Sass theme that sets `--brand-primary` still gets the value of `$brand-primary`. A theme is either all Sass or all CSS variables. Only the unmapped variables can be set as CSS variables in a Sass theme.
3. **Migration mode is a mix today.** Compared with 4.5.1, the neutral theme changed 52 values. 44 of them are mapped, so a Sass theme keeps the Atlas 4 value. 8 are not mapped, so a Sass theme gets the neutral value: `--card-shadow`, `--card-padding`, `--focus-outline-offset`, `--navigation-border-radius`, `--navigation-scrollbar-color`, `--navsidebar-border-radius`, `--navsidebar-icon-height`, `--navsidebar-icon-width`. Two removed variables are also unmapped: `--navsidebar-border-right`, `--navtopbar-border-bottom`.
4. **Sass names give Atlas 4 values even in CSS mode.** `$brand-primary` is the literal `#264ae5`. A module that uses it stays blue in an app with a navy or custom brand color. Only the shades switch to `var(--x)`.
5. **The release copies files but does not delete them.**
6. **The exclusion switches are already in use.** `$exclude-bootstrap` and `$exclude-mxui` can be set to `true` today, and some projects do (the 4.5.0 fix exists for them, and the Themis prototype relies on it). Anything emitted "only when the switch is `true`" changes those projects. A file removed from `atlas` stays in the module package until it is also removed from `Atlas-Design-System`.

### Plan

#### Phase 1: clean the core (next minor after 4.6.0)

Detailed plan: [atlas-plan-1.md](atlas-plan-1.md).

1. `core/widgets/_modal.scss` and `layouts/_layout-atlas.scss`: remove the Sass fallbacks and use `var(--x)` only.
2. Replace the hardcoded colors in `core/` and `layouts/` (62 occurrences in 29 files) with existing tokens. Add a token to `_theme-default.scss` where none fits.
3. Move the feature switches from the bottom of `_theme-default.scss` into one `_config.scss`, so there is one place for the Sass that stays.
4. Add a guard script for development: no value-type Sass variable in `core/`, `layouts/`, or `themes/`. This is a text check only.

#### Phase 2: Atlas 4 as migration mode (4.x, until 5.0.0)

Detailed plan: [atlas-plan-2.md](atlas-plan-2.md).

1. Announce it: Sass theming is deprecated, Atlas 4 is the last version that supports it, and 5.0.0 removes it. Changelog `Deprecated` section, release notes, migration guide.
2. Freeze the mappings file. No new mappings. Optional: add the 10 missing Atlas 4 values so that a Sass theme looks consistent during the migration period (see Decisions needed).
3. Give theme owners what they need to migrate: an updated migration guide and a converter from a Sass `custom-variables.scss` to CSS variables. The mappings file is the source for the conversion table.
4. Tell module owners that Sass color functions and Sass arithmetic on Atlas names will fail in 5.0.0. The Feedback module is affected today; WorkflowCommons is not.

Nothing in this phase changes how a theme compiles or looks.

#### Phase 3: replace the Bootstrap file with Atlas-owned styles (4.x, default flips in 5.0.0)

Detailed plan: [atlas-plan-3.md](atlas-plan-3.md).

`core/_legacy/bootstrap/` is the complete Bootstrap 3.3.4: 7,400 lines, 25% of the compiled CSS, all hardcoded values. It cannot simply be switched off: layouts depend on its box-sizing reset, element resets, glyphicon codes, and the base rules of buttons, forms, tables, tabs, and navigation. A crawl of the deployed reference app (126 pages) shows that only 161 of its 1,336 rules match anything.

Work in slices by area, not file by file, and start with the slice the Themis prototype has already proven: (1) reset, layout shell, and navigation; (2) buttons, forms, tables; (3) the remaining built-in widgets; (4) interaction states such as pop-ups and dialogs. The first slice is a milestone of its own: the layouts look the same with the legacy files off.

1. Write down the Bootstrap class names Atlas keeps supporting.
2. Adopt those rules in Atlas-owned files, on CSS variables. Until 5.0.0 they are emitted behind a new temporary switch, not behind `$exclude-bootstrap` itself, so that projects that already exclude Bootstrap (constraint 6, Themis among them) see no change.
3. Close the gaps in the evidence: interaction states, phone and tablet profiles, pages without a URL.
4. Prove that the reference app looks the same with `$exclude-bootstrap` set to `true` and to `false`.
5. Flip the default to `true` in 5.0.0 (phase 6). Setting it back to `false` is the escape hatch for one major version.
6. Delete the files one major later.

#### Phase 4: replace the mxui file with Atlas-owned styles (4.x, default flips in 5.0.0)

Detailed plan: [atlas-plan-4.md](atlas-plan-4.md).

`core/_legacy/_mxui.scss` is the base stylesheet of the old Dojo client: 3,375 lines, 11% of the compiled CSS. `mxui-core()`, which is emitted when `$exclude-mxui` is `true`, is not enough to remove it: it keeps 3 of the 46 rules in use, and without the others 125 of 126 pages of the reference app change.

1. Confirm that the React client is the only client from Mendix 11.0. Then delete the 403 Dojo rules, `_dijit-widget.scss`, and the `not $use-modern-client` branches. They match nothing.
2. Sort the 204 `mx-*` rules: in use, in use but not seen at rest (pop-ups, dialogs, loading), and old widgets to drop.
3. Adopt the rules in use in Atlas-owned files, on CSS variables, emitted only when `$exclude-mxui` is `true`. `mxui-core()` dissolves into the reset file.
4. Prove that the reference app looks the same with `$exclude-mxui` set to `true` and to `false`.
5. Flip the default to `true` in 5.0.0 (phase 6).
6. Delete the file one major later.

Phases 3 and 4 share the crawl, the equivalence check, and the slices described under phase 3.

Size target for phases 3 and 4 together: the compiled Atlas Core CSS goes from 659 KB to about 400 KB. The Themis setup, which excludes both files and more, compiles to 338 KB.

#### Phase 5: consumers in `web-widgets` (must be released before 5.0.0)

The same widgets are touched again in phase 7, step 1, where they take over their styling from Atlas. Do both in one pass per widget.

1. Data Widgets: replace `var(--x, $fallback)` with `var(--x, <literal>)` or with widget tokens that default to Atlas tokens. Remove the 3 Sass color functions and the values from `variables.scss`.
2. Do the same for `carousel-web`, `timeline-web`, `rich-text-web`, `datagrid-web`, `calendar-web`, `accordion-web`.
3. Stop importing `theme/web/custom-variables` for values. Keep the import only where a feature switch is needed.

This is a hard dependency for phase 6. Once the Sass names resolve to `var(--x)`, a Sass color function or Sass arithmetic applied to one of them is a compile error. The new widget releases must still work with Atlas 4, including Sass themes: check the minimum Atlas and Mendix versions of each module before removing fallbacks. Data Widgets has to be clean before Atlas 5 is released, and Atlas 5 needs a minimum Data Widgets version in its release notes.

#### Phase 6: Atlas Core 5.0.0, one mode

1. **Remove the flag.** Delete `$use-css-variables` from `_variables.scss` and from the app template. `get-color-value()` always returns `var(--x-shade)`.
2. **Remove the mappings.** Delete `_css-variables-mappings.scss`, and the import and the `legacy-variables()` include in `main.scss`. Delete the file in `Atlas-Design-System` as well.
3. **Turn `_variables.scss` into a bridge.** The file keeps its path and its Sass names, but every value name resolves to its CSS variable: `$brand-primary: var(--brand-primary) !default;`. Modules that use the Sass names follow the theme of the app again, which fixes constraint 4.
4. **Make leftovers fail loudly.** After the import, `main.scss` checks the bridged names:
    - A value name that no longer equals its `var(--x)` was set by the theme in Sass. Compilation stops with `@error`, naming the variable and the CSS variable that replaces it.
    - `$use-css-variables: false` stops compilation with a link to the migration guide. `$use-css-variables: true` is ignored, so migrated themes need no edit.
    - A Sass color function or Sass arithmetic on a bridged name (`mix($brand-primary, ...)`, `$spacing-small * 2`) fails in Sass itself. The migration guide explains that error and the replacement: `color-mix()`, or `calc(var(--spacing-small) * 2)`.
    - Sass names that have no CSS variable (398 Sass defaults against 391 mappings) need a decision each: add the CSS variable, or keep a literal.
5. **Bootstrap and mxui off by default.** `$exclude-bootstrap` and `$exclude-mxui` become `true` (phases 3 and 4, step 5). This item is independent of items 1 to 4. If phases 3 and 4 are not finished when 5.0.0 is due, it moves to the next major and 5.0.0 ships without it.
6. **Release notes and changelog.** A `Breaking change` section: Sass theming removed, flag removed, mappings file removed, Sass names are now CSS variable references, Bootstrap file no longer included by default with the list of classes that are no longer styled, minimum versions of Data Widgets and other modules.
7. **Docs.** Rewrite the parts of the Atlas 4 migration guide that describe the flag and the mappings file as current behavior.

To verify before implementing: that `$name == var(--name)` compares as expected in the Sass compiler Studio Pro uses, and that the `@error` text is shown to the user in Studio Pro.

#### Phase 7: move pluggable widget styling out of Atlas Core (last phase)

Detailed plan: [atlas-plan-7.md](atlas-plan-7.md).

Atlas Core keeps the styling of the widgets built into Studio Pro. The styling of pluggable widgets moves to the widgets: 16 widgets, about 1,500 lines in 24 files, and 12 of the 33 keys in `design-properties.json`.

1. In `web-widgets`, each widget takes over its Atlas rules and variants, on Atlas CSS variables with literal fallbacks. Done together with phase 5.
2. In a major version, the per-widget switches that already exist (`$exclude-accordion`, `$exclude-rating`, and so on) become `true` by default. Setting one back to `false` is the escape hatch.
3. One major later, the files and switches are deleted.

Open and to decide first: where the design properties of those widgets live, because a widget package cannot carry them.

#### Later: remove the bridge and the legacy files

- When the modules no longer use the Sass names, `_variables.scss` can shrink to an empty file that only keeps the import path alive. No version planned.
- One major after 5.0.0: delete `core/_legacy/bootstrap/`, `core/_legacy/_mxui.scss`, and their switches (phases 3 and 4, step 6).

#### Verification, in every phase

- Compilation is done by Studio Pro, not by a CI step. Check each change by building the theme into a Mendix project (`npm run build` in `packages/atlas-core` with `MX_PROJECT_PATH` set) and running it; an undefined Sass variable shows up there as a theme compile error.
- Fixtures to keep for phase 6: a migrated CSS theme (must compile unchanged), a Sass theme with the flag unset, a Sass theme with the flag set to `false`, and an app with WorkflowCommons, Feedback, and Data Widgets installed.
- Playwright screenshots in `packages/atlas/e2e`.

### Decisions needed

| # | Question | Recommendation |
| --- | --- | --- |
| 1 | Migration mode look: add the 10 missing Atlas 4 values to the mappings, or leave the mix until 5.0.0? | Add them. It is small, and a Sass theme then looks like Atlas 4 for the whole migration period |
| 2 | Which release carries the deprecation notice? | 4.6.0, together with the neutral theme, so there is one announcement |
| 3 | `$brand-logo`: keep as a Sass switch, or replace with `--brand-logo-url` now that the `AppInfo` snippet supplies the logo? | Open |
| 4 | Data Widgets tokens: an own `--dg-*` layer, or the Atlas tokens directly? | Open |
| 5 | Converter: a script in `atlas`, an `mxcli theme` command, or the Maia theming skill only? | Open |
| 6 | Bootstrap: which utility classes stay supported (`hidden-*`, `visible-*`, `pull-*`)? | Keep `hidden-*` and `pull-*`; decide `visible-*` with usage data |
| 7 | Is the React client the only client for every Mendix version Atlas 5 supports? | To confirm. If yes, the Dojo rules in `_mxui.scss`, `_dijit-widget.scss`, and `$use-modern-client` can be removed outright |
| 8 | Where do the design properties of pluggable widgets live once their styling leaves Atlas Core? | Open. See phase 7 |
| 9 | Exclusion switches and `design-properties.json` are not aligned: a design property still offers classes from a part that is excluded, and then does nothing | Open, outside the current phases |

### Next step

Phase 1, items 1 and 2, and the deprecation notice of phase 2.

### Out of scope

- The native theme (`native/`, TypeScript variables).
- `atlas_web_content` and `atlas_nativemobile_content`, except where their building blocks set Bootstrap classes (phase 3).
- Runtime theme switching (`:root.theme-dark`) as a feature, as prototyped in Themis. A dark variant is used as a test fixture in phase 1, but shipping theme switching is not planned here.

### Review log

2026-10-13, review of all phase files against the source:

- Corrected: migration mode is not gradual (constraint 2). The mappings override CSS variables set by a Sass theme.
- Corrected: the Feedback module does Sass arithmetic on Atlas names and will not compile against the bridge of phase 6 as it is.
- Added: projects that already exclude Bootstrap or mxui are affected by the adoption in 4.x (constraint 6).
- Added: the Bootstrap and mxui default flip is decoupled from the Sass removal in 5.0.0.
- Changed: phase 1 is no longer called "no behavior change" and no longer targets a patch release, because it adds tokens and changes hardcoded colors.
- Open: phase 5 has no detailed plan yet. The decision lists of the phase files are not merged into one.

2026-10-13, after looking at the Themis prototype (`ThemisWindows2.mpk`):

- Decided: Atlas Core stops styling pluggable widgets. Added as phase 7.
- Changed: phases 3 and 4 are done in slices, layout shell first, with Themis as the reference for that slice.
- Changed: adopted rules sit behind a new temporary switch until 5.0.0, so projects that already exclude Bootstrap or mxui are not affected.
- Added: a size target for phases 3 and 4, and a dark theme variant as the test for phase 1.
- Not taken from Themis: its own `--themis-*` token set, literal fallbacks on every value, layout copies under `.layout-themis`, and duplicated snippets.

### Related open points from the 4.6.0 work

- The prototype package (`Atlas_Core_v5.mpk`) removed `_css-variables-mappings.scss`. The 4.6.0 pull request kept it. It is removed in phase 6.
- Model changes for 4.6.0 (`AppInfo` entity, snippet, nanoflow, JavaScript actions, layout changes) live in `Atlas-Design-System`, not in this repository. See the release description in the root `AGENTS.md` of the work folder.
