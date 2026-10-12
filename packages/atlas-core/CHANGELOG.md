# Changelog

All notable changes to this module will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [4.6.0] Atlas Core - 2026-10-12

### Breaking change

-   We changed the default theme to Atlas Neutral. Apps that do not set the following in `theme/web/custom-variables.scss` get new defaults:
    -   Brand colors: `--brand-primary` is now navy (`#243b53`) instead of blue (`#264ae5`), with quieter success, warning and danger colors.
    -   Font: `--font-family-base` is now the system font stack instead of Poppins. Poppins is still shipped with Atlas.
    -   Corners: `--border-radius-s/-m/-l` are now 2 / 4 / 8px instead of 4 / 8 / 12px, and the default is `--border-radius-m`.
    -   Page, text and border colors are neutral grays and no longer tinted by the brand color.
    -   Labels and badges are soft (light tint with dark text) instead of solid with white text.
    -   Buttons, grids and cards: neutral default button, quieter grid hover and selection, cards without shadow and with medium padding.
    -   `--focus-outline-offset` is now `-2px`, so the focus outline is drawn inside the element.
    -   `--brand-logo-width` and `--brand-logo-height` are now 32px instead of 36px.
-   Atlas no longer sets the navigation region variables (`--topbar-bg`, `--topbar-color`, `--topbar-border-color`, `--sidebar-bg`, `--navbar-brand-name`, and the `--navsidebar-*` and `--navtopbar-*` colors) or the shared navigation colors (`--navigation-color*`, `--navigation-sub-color*`, `--navigation-bg*`, `--navigation-sub-bg*`, `--navigation-border-color`). They remain available as overrides, so themes that set them keep their look. Apps that relied on the Atlas defaults get one dark primary bar and one light secondary bar per layout, which no longer follow the brand color.
-   A theme that sets only the background of a navigation region must also set the text colors of that region, or `--navigation-color`. Otherwise the text uses the secondary bar color in layouts where that region is the secondary bar.
-   Sidebar navigation items are now full width without rounded corners, and the icon box is 40px instead of 52 x 44px.

### Added

-   We added the `--bar-primary-*` and `--bar-secondary-*` theme variables (`bg`, `bg-hover`, `bg-active`, `color`, `color-hover`, `color-active`, `sub-color`, `title-color`, `border-color`, `edge`) to style the navigation bars by role. Each layout has one primary bar and at most one secondary bar: in Atlas_SideBar the sidebar is primary and the top bar secondary, in Atlas_Default the top bar is primary and the sidebar secondary.
-   We added a hover highlight for cards with an on-click action, with the new `--card-border-color-hover` and `--card-shadow-hover` variables. The transition is disabled when the user prefers reduced motion.
-   We added `--navsidebar-label-indent`, `--navsidebar-sub-glyph-size`, `--navsidebar-spacing` and `--navigation-sub-item-padding` to control the alignment of sidebar items.
-   We added a 2px inset bar on the current page in the sidebar (`--navsidebar-box-shadow-active`).
-   We added styling for the app logo (`sidebar-brand-logo`) and app name (`sidebar-brand-name`) in the sidebar and top bar. The logo size follows `--brand-logo-width` and `--brand-logo-height`, the name follows the title color of its bar, and long names end in an ellipsis.
-   We added a default `logo.svg` to the public folder. An app's `theme/web/logo.svg` or a theme module's `public/logo.svg` overrides it.
-   We added a default chart theme, `com.mendix.charts.json`, with a 10-color palette for charts that have theme folder config loading enabled. An app's `theme/web/com.mendix.charts.json` overrides it.

### Changed

-   We aligned all sidebar labels in one column, including items without an icon, and centered sub-item icons in the icon column of their parent.
-   We changed the collapsed sidebar so that labels and the app name fade out instead of wrapping, and the fly-out menu no longer indents its items.
-   We changed the sidebar toggle button to animate only its position, rotation and opacity.
-   We changed the language selector text to follow the color of the bar it is placed in.
-   We changed the mobile header to use `--topbar-bg` and `--topbar-color` when set, and the primary bar colors otherwise.

### Fixed

-   We fixed an issue where the active item in the top bar navigation was not styled because the selector never matched.
-   We fixed an issue where sidebar navigation items did not get their hover style.
-   We fixed an issue where the secondary top bar background did not fall back to `--navtopbar-bg` when `--navtopbar-bg-secondary` was not set.

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
