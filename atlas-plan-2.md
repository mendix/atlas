# Atlas plan, phase 2: Atlas 4 as migration mode

Part of [Moving Atlas Core fully to CSS variables](atlas-plans.md). Status: plan only, nothing implemented. Written 2026-10-13.

Target: Atlas Core 4.x, from 4.6.0 until 5.0.0 is released. Nothing in this phase changes how a theme compiles.

## What migration mode is

Atlas 4 accepts two kinds of theme:

| Theme | How it is recognized | What Atlas does |
| --- | --- | --- |
| CSS variable theme | `$use-css-variables: true` in `theme/web/custom-variables.scss` | Uses the CSS variables as they are |
| Sass theme | Flag unset or `false` | `legacy-variables()` in `_css-variables-mappings.scss` writes each Sass value into the matching CSS variable (391 mappings) |

The second row is the migration mode: a Sass theme keeps working until its owner migrates. Atlas 5 removes it (phase 6 of the main plan). Phase 2 is about saying so clearly and making the move easy.

The migration is a switch, not a gradual path. In a Sass theme the mappings are emitted after the theme's own `:root` block and override it. Checked on 2026-10-13: a Sass theme that sets `--brand-primary: #ff0000` still renders `#264ae5`, the value of `$brand-primary`. So a theme owner converts the whole `custom-variables.scss` and then sets the flag to `true`. The guide and the converter must be written for that.

## Items

### 1. Announce the deprecation

- `packages/atlas-core/CHANGELOG.md`: a `Deprecated` section. Sass theming and `$use-css-variables` are deprecated; Atlas Core 5.0.0 removes them; a theme that still sets Sass values will then fail to compile.
- Release notes of the same version, with a link to the migration guide.
- File header of `_css-variables-mappings.scss` and `_variables.scss`: "migration mode, removed in 5.0.0, do not add to this file".

Recommended release: 4.6.0, with the neutral theme, so there is one announcement.

### 2. Freeze the mappings, and decide on the mix

The mappings file gets no new entries. New CSS variables (26 added by the neutral theme) are not available to Sass themes.

One open point. After the neutral theme, a Sass theme renders a mix:

| | Count | A Sass theme gets |
| --- | --- | --- |
| Changed by the neutral theme, mapped | 44 | The Atlas 4 value: brand colors, font, radius, labels, buttons, grid |
| Removed from the theme defaults, still mapped | 45 | The Atlas 4 value: bar gradients, navigation colors |
| Changed, not mapped | 8 | The neutral value |
| Removed, not mapped | 2 | Nothing |

The 10 unmapped ones: `--card-shadow`, `--card-padding`, `--focus-outline-offset`, `--navigation-border-radius`, `--navigation-scrollbar-color`, `--navsidebar-border-radius`, `--navsidebar-icon-height`, `--navsidebar-icon-width`, `--navsidebar-border-right`, `--navtopbar-border-bottom`.

Option A (recommended): add these 10 to `legacy-variables()` as literal Atlas 4 values. They have no Sass variable, so they are not mappings in the strict sense. A Sass theme then looks like Atlas 4 for the whole migration period. The values are in the appendix "the Atlas Core 4 look" of the 4.6.0 change description (PAG-3015).

Option B: leave the mix. Less work, but a Sass app upgraded to 4.6 has flat cards and the new sidebar sizes on Atlas 4 colors.

### 3. Migration guide

The guide exists: `refguide/installation/upgrading-from-10-to-11/atlas4-migration.md` in the docs repository. Changes:

- Section 1.4, "Atlas 4 Backward Compatibility": name it migration mode, state that it ends with Atlas 5.
- Section 1.2 says the flag goes at the top of `custom-variables.scss`; the app template has it at the bottom, before the import of `variables`. Both work. Describe the template as it is.
- Part 2, "Migrating Your Application": add the converter (item 4), and state that the conversion is done in one go: CSS variables set in a Sass theme are overridden until the flag is `true`.
- Part 3, "Ensuring Module Compatibility": add what changes in Atlas 5. The Sass names stay but resolve to `var(--x)`, so `mix()`, `darken()`, and similar functions on them stop compiling. Show the `color-mix()` replacement, which the guide already covers in section 1.3.
- New short section: how to check that an app is ready for Atlas 5. No value-type Sass variable set in `theme/web/`, no Sass color function on an Atlas name in the app's own modules.

### 4. Converter

Input: a Sass `custom-variables.scss`. Output: the same theme as `:root { --x: ...; }` plus `$use-css-variables: true;`.

- The conversion table comes from `_css-variables-mappings.scss`: each line is `--name: #{$name}`.
- Literal values convert directly. Values derived from other Sass variables become `var(--other)`.
- Sass color functions cannot be converted mechanically. The converter lists them with the line number and suggests the `color-mix()` form.
- Feature switches (`$brand-logo`, `$font-family-import`, `$form-input-style`, `$btn-bordered`), `$exclude-*`, and `$screen-*` are left untouched.

Where it lives is open: a script in this repository, an `mxcli theme` command, or the Maia theming skill.

### 5. Module owners

| Module | Uses of Atlas Sass names | Sass color functions or arithmetic on them | Action |
| --- | --- | --- | --- |
| WorkflowCommons | 33, and imports `atlas_core/web/variables` by path | None. Uses the names inside `calc()` only, which keeps working | Will keep compiling in Atlas 5. Ask to move to `var(--x)` over time |
| Feedback module | 35 | Arithmetic: `gap: $spacing-small * 2` in `button-group.scss` | **Will not compile in Atlas 5 as it is.** Needs a release that uses `calc()` before Atlas 5 |
| Data Widgets | 125 in the installed module | 3 color functions, on its own variables | Ours. Phase 5 of the main plan, and it must be released before Atlas 5 |
| Third-party and customer modules | Unknown | Unknown | Covered by the deprecation notice and the guide |

## What phase 2 does not do

- It does not move `_variables.scss` or the mappings file. `_variables.scss` is imported by path from every app and from WorkflowCommons.
- It does not change the default of `$use-css-variables`.
- It does not add a compile-time warning. Whether Studio Pro shows Sass `@warn` output is unknown; if a test shows that it does, a warning for Sass themes can be added here.

## Order

1. Item 1, in 4.6.0.
2. Item 2, option A, in 4.6.0 or the next patch.
3. Items 3 and 4, before the Atlas 5 beta.
4. Item 5, as soon as the Atlas 5 date is known.

## Open decisions

| # | Question | Recommendation |
| --- | --- | --- |
| 1 | Option A or B for the mix? | A |
| 2 | Deprecation notice in 4.6.0? | Yes |
| 3 | Where does the converter live? | Open |
| 4 | Test whether Studio Pro shows `@warn`? | Yes, one test; decides whether a warning is worth adding |
