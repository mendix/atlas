# Changelog

All notable changes to this module will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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
