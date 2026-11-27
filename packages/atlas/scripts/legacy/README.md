# Atlas_Legacy.mpk

Model-only module package used by the e2e legacy mode (`npm run e2e:legacy`). It contains an empty `Atlas_Legacy`
module; the styles are copied from `src/themesource/atlas_legacy` at run time, so the package does not change when the
styles do.

The module is marked as a Marketplace module (`FromAppStore`), so Studio Pro compiles it before the UI resources modules,
Atlas Core among them. It is not a UI resources module: `mx module-import` refuses those.

How it was made (Mendix 11.0.0.73100):

1. In a copy of the Atlas-Design-System app, add an empty module `Atlas_Legacy`.
2. `mx create-module-package <app>.mpr Atlas_Legacy`
3. In the package's `project.mpr`, set `FromAppStore` of the `Projects$ModuleImpl` unit to `true`, then zip the package again.
