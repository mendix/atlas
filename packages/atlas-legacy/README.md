# Atlas Legacy module automation

This is the package being used to automate the build of the Atlas Legacy module.

Atlas Legacy keeps the Atlas 4 look for apps that upgrade to Atlas Core 5. It runs on top of Atlas Core and holds the
styling that only exists to keep that look: Bootstrap 3 and the look part of the old client stylesheet (mxui). It owns
all the Sass it needs and does not read Atlas Core's Sass variables, mixins or `$exclude-*` switches.

Atlas Legacy is not released before Atlas Core 5.0.0. Until then, Atlas Core 4.x still emits the same rules unless
`$exclude-bootstrap` and `$exclude-mxui` are set to `true`.

## Building

Set `MX_PROJECT_PATH` to the absolute path of a Mendix project and run:

-   `npm run build:module` to copy the styles to `themesource/atlas_legacy` of that project once.
-   `npm run start` to copy the styles and keep copying them on change.
-   `npm run release` to copy the styles to `dist`.

The Mendix project needs a module named `Atlas_Legacy` for Studio Pro to compile its styles.

## Changelog

Changes in the module should be present in the `CHANGELOG.md` file.
