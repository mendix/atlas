# Atlas Core module automation

This is the package being used to automate the release of Atlas Core module.

## Changelog

Changes in the module should be present in the `CHANGELOG.md` file.

## Atlas 3 to Atlas 4

### Highlight

-   Atlas 4 will fully utilize css variables instead of SASS variables. All the available css variables can be seen at `Atlas-core/Styling/web/themes/_theme-default.scss`.
-   Currently, atlas 4 is released under compatibility mode. To fully ignore SASS variables mapping in styling, user can add `$use-css-variables: true;` inside their `Styling/web/custom-variables.scss`.
-   For backward compatibility, we maintain `_variables-css-mappings.scss` file which contains conversion from SASS to CSS variables.
    This file is now renamed into `_css-variables-mappings.scss` with a few minor changes.

### Debugging and overriding css variables

CSS variables can easily be viewed and overridden on the browser.
Simply run the application, open developer console (`F12` or `(ctrl|cmd) + shift + I`).

In the elements tab, on the right side, find the Styles tab.
Scroll down, and user can see the compiled version of css variables from `color-variants.scss` and `theme-default.scss`
right click and press "copy rule".
paste this rules inside your own Styling folder to change the value and overrides.

### Color mix

darker, dark, light, lighter suffix variables (gray, brand-primary, brand-success, brand-warning, brand-danger, brand-default) will no longer use sass function `mix` in favor of css function color-mix.
and there will be a new `color-variants.scss` file to support this mapping which will produce css variables such as:

```
    --gray-50: color-mix(in srgb, var(--gray), var(--color-base) 90%);
    --gray-100: color-mix(in srgb, var(--gray), var(--color-base) 80%);
    --gray-200: color-mix(in srgb, var(--gray), var(--color-base) 60%);
    --gray-300: color-mix(in srgb, var(--gray), var(--color-base) 40%);
    --gray-400: color-mix(in srgb, var(--gray), var(--color-base) 20%);
    --gray-500: color-mix(in srgb, var(--gray), var(--color-contrast) 0%);
    --gray-600: color-mix(in srgb, var(--gray), var(--color-contrast) 20%);
    --gray-700: color-mix(in srgb, var(--gray), var(--color-contrast) 40%);
    --gray-800: color-mix(in srgb, var(--gray), var(--color-contrast) 50%);
    --gray-900: color-mix(in srgb, var(--gray), var(--color-contrast) 60%);
```

These variables will then mapped to the previously darker, dark, light, and lighter color variants:

```
    --gray-lighter: var(--gray-50);
    --gray-light: var(--gray-300);
    --gray-primary: var(--gray-200);
    --gray-dark: var(--gray-700);
    --gray-darker: var(--gray-800);
```

The full list of css variables can be seen inside developer console upon running the application.

If you previously rely on the sass functions to build your color variants, please update.
