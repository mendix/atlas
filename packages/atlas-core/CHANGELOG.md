# Changelog

All notable changes to this module will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Breaking change

-   The default theme is now Atlas Neutral. Apps that set their own values in `theme/web/custom-variables.scss` keep them; everything an app left to Atlas changes:
    -   brand colors: navy primary and quieter success, warning and danger colors
    -   a system font stack instead of Poppins (Poppins is still bundled)
    -   neutral page, text and border colors, no longer tinted by the brand color
    -   smaller corners (2 / 4 / 8px)
    -   soft labels and badges (tinted background, dark text)
    -   neutral default buttons, a quieter grid selection, flat cards
    -   the focus outline is drawn inside the element
    -   a 32px logo
-   Navigation bars no longer follow `--brand-primary`. Each layout now has one primary bar (dark by default) and may have one secondary bar (light by default):

    | Layout        | Primary bar | Secondary bar |
    | ------------- | ----------- | ------------- |
    | Atlas_SideBar | sidebar     | top bar       |
    | Atlas_Default | top bar     | sidebar       |
    | Atlas_TopBar  | top bar     | —             |

-   Atlas no longer sets the navigation region variables (`--topbar-*`, `--sidebar-bg`, `--navsidebar-*` and `--navtopbar-*` colors, `--navbar-brand-name`) or the shared navigation colors (`--navigation-color*`, `--navigation-bg*`, `--navigation-sub-*`, `--navigation-border-color`). They still work as overrides, so a theme that sets them keeps its look.
-   A theme that sets only a region's background must also set that region's text colors, or `--navigation-color`. Otherwise, where that region is the secondary bar, its text is dark.
-   Layouts copied from Atlas get the bar colors only if they keep the `region-topbar` and `region-sidebar` classes. To show the app logo and name, add the `AppInfo` snippet.
-   Sidebar navigation items are full width, without rounded corners, and the icon box is 40px.

**To keep the previous look:** before upgrading, paste the block below into the `:root` of `theme/web/custom-variables.scss`, and delete every line for a variable the app already sets. You can then remove lines one by one to adopt parts of the new look. Layout details (sidebar alignment, the current-page marker) change regardless.

<details>
<summary>Previous look (Atlas Core 4.5)</summary>

```scss
/* Previous Atlas look, kept through the upgrade to Atlas Core 4.6 */
--brand-primary: #264ae5;
--brand-success: #16aa16;
--brand-warning: #cd8501;
--brand-danger: #ea3337;
--brand-default: color-mix(in srgb, var(--brand-primary) 10%, #e7e7e9);
--brand-primary-hover: var(--brand-primary-700);
--bg-color: var(--brand-default-100);
--border-color-default: var(--brand-default-300);
--font-family-base: "Poppins", sans-serif;
--font-color-detail: var(--brand-primary-700);
--font-color-header: var(--brand-primary-800);
--border-radius-s: 4px;
--border-radius-m: 8px;
--border-radius-l: 12px;
--border-radius-default: var(--border-radius-s);
--topbar-bg: linear-gradient(to bottom, var(--brand-primary-500), var(--brand-primary-600));
--sidebar-bg: linear-gradient(to bottom, var(--brand-primary-600), var(--brand-primary-700));
--navigation-color: var(--font-color-contrast);
--navigation-color-hover: var(--font-color-contrast);
--navigation-color-active: var(--font-color-contrast);
--navigation-bg-hover: rgba(0, 0, 0, 0.2);
--navigation-bg-active: rgba(0, 0, 0, 0.3);
--navigation-sub-bg: rgba(0, 0, 0, 0.2);
--navigation-sub-bg-hover: var(--navigation-bg-hover);
--navigation-border-radius: var(--border-radius-m);
--navigation-scrollbar-color: rgba(255, 255, 255, 0.5) transparent;
--navigation-border-color: var(--navigation-bg-hover);
--navsidebar-sub-bg-collapsed: var(--brand-primary-700);
--navsidebar-shadow: 0 0 4px rgb(0 0 0 / 14%), 2px 4px 8px rgb(0 0 0 / 28%);
--navsidebar-sub-bg: rgba(0, 0, 0, 0.2);
--navsidebar-sub-bg-header: rgba(0, 0, 0, 0.2);
--navsidebar-border-radius: var(--navigation-border-radius);
--navsidebar-border-right: none;
--navsidebar-icon-height: 44px;
--navsidebar-icon-width: 52px;
--navtopbar-border-bottom: none;
--m-header-color: var(--font-color-contrast);
--btn-primary-bg: var(--brand-primary-600);
--btn-default-color: var(--brand-primary);
--btn-default-icon-color: var(--gray);
--grid-bg-hover: var(--brand-default-hover);
--grid-bg-selected: var(--brand-default);
--grid-bg-selected-hover: var(--brand-default-600);
--form-input-placeholder-color: var(--gray-600);
--form-input-border-hover-color: color-mix(
    in srgb,
    var(--form-input-border-color),
    var(--form-input-border-focus-color) 50%
);
--focus-outline-offset: 2px;
--brand-logo-height: 36px;
--brand-logo-width: 36px;
--card-shadow: var(--shadow-small) var(--shadow-color);
--card-padding: var(--spacing-large);
--label-default-bg: var(--brand-default);
--label-primary-bg: var(--brand-primary-600);
--label-success-bg: var(--brand-success-600);
--label-warning-bg: var(--brand-warning-600);
--label-danger-bg: var(--brand-danger-600);
--label-default-border-color: var(--brand-default-600);
--label-primary-border-color: var(--brand-primary-600);
--label-success-border-color: var(--brand-success-600);
--label-warning-border-color: var(--brand-warning-600);
--label-danger-border-color: var(--brand-danger-600);
--label-default-color: var(--font-color-default);
--label-primary-color: var(--color-base);
--label-success-color: var(--color-base);
--label-warning-color: var(--color-base);
--label-danger-color: var(--color-base);
```

</details>

### Added

-   `--bar-primary-*` and `--bar-secondary-*` theme variables to style the navigation bars by role: `bg`, `bg-hover`, `bg-active`, `color`, `color-hover`, `color-active`, `sub-color`, `title-color`, `border-color` and `edge`.
-   `AppInfo` snippet that shows the app logo and app name, with a non-persistable `AppInfo` entity filled by a nanoflow:
    -   `JSA_GetAppName` reads the Application title of the navigation profile.
    -   `JSA_GetAppLogoUrl` uses the app's own `logo.svg`, otherwise the App icon of the navigation profile.
-   A default `logo.svg` (the Mendix brandmark) at the web root. The app's `theme/web/logo.svg` or a theme module's `public/logo.svg` overrides it.
-   A default chart palette, `com.mendix.charts.json`, for charts with theme configuration enabled. The app's `theme/web/com.mendix.charts.json` or a theme module's overrides it.
-   A hover highlight for clickable cards, off when reduced motion is preferred.
-   A 2px inset bar marking the current page in the sidebar.
-   Variables for sidebar item alignment and spacing, including `--navigation-sub-item-padding`.

### Changed

-   Layouts:
    -   Atlas_SideBar shows the logo and app name in the sidebar header. Its top bar has the classes `region-topbar topbar-secondary`.
    -   Atlas_Default and Atlas_TopBar show the logo and app name in the top bar's `.navbar-brand`.
    -   The app name takes the bar's title color in every layout and ends in an ellipsis when it is too long.
-   The `Content.Mendix` image is now the Mendix brandmark.
-   Sidebar labels align in one column, including items without an icon, and sub-item icons are centered under their parent's icon.
-   The collapsed sidebar fades labels and the app name out instead of wrapping them, and the fly-out menu no longer indents items.
-   The sidebar toggle button animates only position, rotation and opacity.
-   The language selector text follows the color of its bar. Its "Contrast" color setting is no longer used.
-   The mobile header uses `--topbar-bg` and `--topbar-color` when set, otherwise the primary bar colors.

### Fixed

-   The active item in the top bar navigation is now styled.
-   Sidebar navigation items now get their hover style.
-   The secondary top bar background falls back to `--navtopbar-bg` when `--navtopbar-bg-secondary` isn't set.

## [4.5.1] Atlas Core - 2026-10-9

### Changed

-   We improved the styling of the Text Area widget to make its height easier to customize.

## [4.5.0] Atlas Core - 2026-9-3

### Fixed

-   We fixed an issue where exclude-bootstrap and exclude-mxui variable creates compile error when set to true

## [4.4.0] Atlas Core - 2026-8-14

### Fixed

-   We fixed an issue where the color variants were declared multiple times due to repeated imports of the Atlas Core variables.

## [4.3.8] Atlas Core - 2026-8-6

### Fixed

-   We fixed an issue where the validation feedback of the Check Box widget was not full width and its height depended on the label length.

## [4.3.7] Atlas Core - 2026-6-24

### Changed

-   We removed legacy styling for switch widget below version 3.0.

### Fixed

-   We added scss variables fallback for css variables styling in modal-dialog.

## [4.3.6] Atlas Core - 2026-4-23

### Fixed

-   We fixed an issue with logo overriding using $brand-logo variable not working correctly.

## [4.3.5] Atlas Core - 2026-3-26

### Fixed

-   We fixed an issue where the scroll container did not stretch to the full height in popup layouts.
-   We fixed an issue with Text Box widget in vertical form orientation.
-   We fixed an issue where circular references in legacy-variables() would cause undefined variables, in projects not using CSS custom properties yet.

## [4.3.4] Atlas Core - 2026-2-25

### Fixed

-   We fixed an issue with label alignment in Check Box widgets.
-   We fixed an issue Text Box widget being stretched when corresponding label is multiline.

## [4.3.3] Atlas Core - 2026-1-30

### Fixed

-   We fixed an issue with scroll container regions not scrolling correctly in some cases.

## [4.3.2] Atlas Core - 2026-1-20

### Fixed

-   We fixed an issue where $brand-logo was not visible after upgrading Studio Pro.
-   We fixed an issue with radio buttons being distorted in some cases.
-   We fixed an app exception caused by fontSize: 0 in the React Native New Architecture.

## [4.3.0] Atlas Core - 2025-10-10

### Breaking change

-   Layout Behavior: behavioral changes may be observed in layouts, particularly concerning the topbar component
-   Language selector: we changed language selector to use combobox instead of the widget.

### Changed

-   Moved .sr-only from bootstrap to base
-   Topbar redesign incl. horizontal centering
-   Introduced configurable options for the topbar bottom border and sidebar border
-   General layout improvements

### Fixed

-   We fixed an issue with sidebar menu not overlaying some elements in modern client.
-   We fixed an issue where sr-only input checkbox still showed up in switch widget.
-   Resolved issues pertaining to active navigation item styling and behavior
-   Reduced navigation padding

## [4.1.3] Atlas Core - 2025-7-28

### Fixed

-   We fixed an issue where form label incorrectly aligned.
-   We fixed an issue where focus styling on input gets clipped by dataview.

## [4.1.2] Atlas Core - 2025-7-17

### Fixed

-   We fixed an issue where dataview scrollbar is not placed on content when dataview is placed as first element on the page.
-   We fixed an issue where filter failed to render correctly on ios.

## [4.1.1] Atlas Core - 2025-7-2

### Fixed

-   We fixed login page is not showing the image.
-   We fixed too much spacing between radio buttons and their values.
-   We fixed broken slider with label.
-   We fixed invisible checkbox disabled control.

## [4.1.0] Atlas Core - 2025-6-20

### Breaking change

-   Design properties updates:
    -   Introduced group names.
    -   Introduced form orientation on document level.
    -   Introduced label width on document level.
    -   Introduced design properties on layout grid columns and rows.
-   Theme variables updates:
    -   accessibility improvements.
    -   consistency and flexibililty improvements.
-   Default fonts (Poppins) is now shipped with atlas.
-   Introduced hover effect on input widgets.
-   Apply similar styling for modal header if h2 is used.

## [4.0.1] Atlas Core - 2025-6-2

### Fixed

-   We fixed an issue where first element on the page failed to set to full height on react client.
-   We fixed an issue where form vertical label not rendered correctly on rtl direction.

## [4.0.0] Atlas Core - 2025-5-8

### Breaking change

-   Atlas major changes. Atlas 4 will fully utilize css variables instead of SASS variables.

## [3.18.0] Atlas Core - 2025-5-27

### Fixed

-   We fixed an issue where first element on the page failed to set to full height on react client.
-   We fixed an issue where form vertical label not rendered correctly on rtl direction.

## [3.17.0] Atlas Core - 2025-4-16

### Changed

-   We updated studio pro minimum version to 10.21 to support Mendix 11.

## [3.16.4] Atlas Core - 2025-2-12

### Fixed

-   We fixed an issue where inner data view incorrectly rendered on modern client.

## [3.16.3] Atlas Core - 2025-1-30

### Fixed

-   We fixed an issue where data view incorrectly render on modern client.

### Changed

-   We changed the import order of custom variable to make it work with CSS variables. Thanks @askii2 for contribution.

## [3.16.2] Atlas Core - 2024-12-12

### Fixed

-   We fixed an issue where Atlas_Topbar layout showing incorrect padding in topbar menu.

## [3.16.1] Atlas Core - 2024-12-9

### Fixed

-   We fixed an issue where focus would show up when opening delete confirmation dialog.

### Changed

-   We update atlas-core minimum version to SP 10.12.6.

## [3.15.0] Atlas Core - 2024-11-4

### Fixed

-   We fixed an issue with **hide on tablet** and **hide on phone** design properties not working correctly on some devices.

### Added

-   We added language translation for design properties.
-   We added the styling of popup menu widget to atlas.

## [3.14.5] Atlas Core - 2024-10-2

### Fixed

-   We fixed an issue where text in the tab container was cut off at the bottom when Accessibility Display and Text settings were set to the maximum value.

## [3.14.4] Atlas Core - 2024-9-12

### Fixed

-   We fixed sidebar menu when using app with react mode.

## [3.14.3] Atlas Core - 2024-7-31

### Fixed

-   We fixed topbar submenu font size to be smaller than menu itself.

## [3.14.2] Atlas Core - 2024-4-25

### Fixed

-   We fixed dataview footer buttons not displaying properly if dojo widget is being put inside.

## [3.14.1] Atlas Core - 2024-4-4

### Fixed

-   We have fixed an issue where icons within Floating Action Buttons were not properly centered.

## [3.14.0] Atlas Core - 2024-1-25

### Changed

-   We removed "$use-modern-client" variable from the "theme/web/exclusion-variables.scss" file. It is no longer needed to change this variable manually when using Mendix 10.7.0 and above.

## [3.13.1] Atlas Core - 2024-1-17

### Fixed

-   We fixed missing widgets in the module.

## [3.13.0] Atlas Core - 2023-12-21

### Changed

-   We updated the design properties.
-   We updated the feedback widget in the Atlas layouts to the one included in the [Mendix Feedback Module](https://marketplace.mendix.com/link/component/205506). To ensure that it works properly, please download or update the Feedback Module directly from Marketplace.

## [3.12.2] Atlas Core - 2023-12-7

### Changed

-   We update template pages to support modern client.

## [3.12.1] Atlas Core - 2023-10-16

### Fixed

-   We fixed an issue with Scroll Container sidebar having unwanted scrollbars in the modern client.

## [3.12.0] Atlas Core - 2023-9-22

## Added

-   We introduced styles for Scroll Container in the modern client. If you are using the modern client, enable it by setting "$use-modern-client" to "true" in the "theme/web/exclusion-variables.scss" file.

## [3.11.4] Atlas Core - 2023-9-8

### Added

-   We improved styles for form controls when they are focused.

## [3.11.3] Atlas Core - 2023-9-1

### Added

-   We added focus state styling to PopupLayout close button.

## [3.11.2] Atlas Core - 2023-7-21

### Fixed

-   We fixed an issue on getting github assets from tag on marketplace release script

## [3.11.1] Atlas Core - 2023-6-28

### Fixed

-   We fixed an issue with top bar menu goes under sticky position

## [3.11.0] Atlas Core - 2023-6-12

### Changed

-   Removal of some direct child selector styles

### Fixed

-   Lined and filled icon style

## [3.10.0] Atlas Core - 2023-5-12

### Changed

-   Remove duplicated Open Sans font

### Breaking changes

-   Minimum required version of Studio Pro is set to v9.24.0.

### Added

-   New styling content: icon collections. Starting from this version Atlas Core include two icon collections: lined and filled.

## [3.9.2] Atlas Core - 2023-5-3

### Fixed

-   We fixed an issue with missing design properties for native.

## [3.9.1] Atlas Core - 2023-5-1

### Changed

-   Remove duplicated Open Sans font

## [3.9.0] Atlas Core - 2023-3-15

### Changed

-   Minimal required version of Studio Pro is v9.18.4 and above.

## [3.8.3] Atlas Core - 2023-1-4

### Changed

-   We fixed an issue with styling conflicts.

## [3.8.2] Atlas Core - 2022-11-21

### Fixed

-   We fixed an issue with missing logo (Ticket #167937)

## [3.8.1] Atlas Core - 2022-11-1

### Changed

-   Update Language Selector and other widgets

## [3.8.0] Atlas Core - 2022-10-28

### Changed

-   We migrated from Google Fonts to locally hosted fonts.

## [3.7.0] Atlas Core - 2022-10-27

### Added

-   We added Atlas styling support for Gallery Native widget.
-   We added Atlas styling support for Gallery Text Filter Native widget.

## [3.6.1] Atlas Core - 2022-9-26

### Changed

-   We added error style to datepicker, dropdown and referenceSelector widgets.

## [3.6.0] Atlas Core - 2022-9-23

### Changed

-   We added Language Selector widget to Atlas_Default and Atlas_TopBar responsive layouts.
-   Minimal required version of Studio Pro is v9.12.0 and above.

## [3.5.0] Atlas Core - 2022-7-15

### Changed

-   We updated Feedback widget to the latest version.

### Fixed

-   We fixed the issue with sidebar "Slide over content" configuration.

## [3.4.0] Atlas Core - 2022-7-11

### Fixed

-   We fixed the issue with checkbox elements producing rendering artifacts.

### Added

-   We added Atlas styling support for Background Gradient widget.

## [3.3.1] Atlas Core - 2022-6-17

### Fixed

-   We fixed custom styles issue for column chart native widget.

## [3.3.0] Atlas Core - 2022-6-16

### Added

-   We added styles for column chart native widget.

## [3.2.3] Atlas Core - 2022-6-15

### Fixed

-   We fixed hover issue for dropdown menu in navigation bar.

## [3.2.2] Atlas Core - 2022-5-10

### Added

-   We added a new design property for Tooltip widget.

## [3.2.1] Atlas Core - 2022-04-01

### Fixed

-   We fixed this module to be compatible with strict CSP mode.

## [3.2.0] Atlas Core - 2022-02-25

### Added

-   Added support for setting variables using relative length CSS units.

## [3.1.1] Atlas Core - 2022-02-18

### Fixed

-   We fixed an issue with logo covering the whole login page when opening in firefox (Ticket 141170).

## [3.1.0] Atlas Core - 2022-02-02

### Added

-   We added design properties to add shadows in containers. Thanks Ronnie van Doorn.

## [3.0.9] Atlas Core - 2022-01-24

### Fixed

-   We corrected the border styling for the Floating Action Button native widget when in Dark Mode.

## [3.0.8] Atlas Core - 2021-12-03

### Added

-   We added a design property to align the content of the image widget.

## [3.0.7] Atlas Core - 2021-09-28

### Changed

-   We fixed a problem with the styles of groupbox widget not respecting the header mode element size (Ticket #131119).

## [3.0.6] Atlas Core - 2021-08-12

### Changed

-   We fixed the z-index (priority) of the menu bar.

## [3.0.5] Atlas Core - 2021-07-27

### Changed

-   We moved resource files from web/resources to public folder.

## [3.0.4] Atlas Core - 2021-07-16

### Added

-   We added exclusion variables for core styles, layouts and bootstrap.

### Changed

-   We fixed the styles of links (added cursor pointer).
-   We fixed the sidebar sub menu items when the sidebar is closed.

### Removed

-   We removed the restrictions to show the toggle sidebar widget only on phones.
-   We removed San Francisco font from default font variable.

## [3.0.3] Atlas Core - 2021-06-29

### Added

-   Add default & helper styles for the accordion widget.
-   Add specific style variables for the accordion widget.
-   We added a default minHeight to the maps widget.
-   We added design properties for Barcode Scanner widget.

### Changed

-   We defined the module as UI Resource.
-   We fixed the behavior of sidebar and introduced new variables for open and closed width.
-   We changed the default web responsive layout sidebar to be initially open.

### Removed

-   We removed the maxWidth property of the dropdown widget to fix an issue on large screens
