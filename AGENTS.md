# Mendix Atlas

Monorepo for Atlas UI, the styling framework for Mendix apps, and the Marketplace modules built from it. npm, no workspaces tooling.

## Packages

-   `packages/atlas` — Atlas UI source (`src/theme`, `src/themesource`: web SCSS + native TS), build scripts, Playwright E2E
-   `packages/atlas-core` — Atlas Core Marketplace module, packaged from `packages/atlas`
-   `packages/atlas-web-content` — Atlas Web Content module
-   `packages/atlas-content-native` — Atlas Native Content module

## Conventions

-   Conventional commits enforced by commitlint: `type(scope): description`
-   Prettier for formatting (`prettier.config.js`)
-   Semver + CHANGELOG.md per Marketplace module; changelog entries describe user-visible behaviour, not implementation details
-   Changelogs added during development, version bumps only at release time
-   Don't override core Atlas classes in ways that break existing apps; theme customisation goes through variables

## Constraints

-   Never modify `dist/`, generated files, or lockfiles

## OpenSpec

-   Specs and changes live in the root `openspec/` directory; run `openspec` commands from the repo root
-   Workflows: `/opsx:propose`, `/opsx:explore`, `/opsx:new`, `/opsx:continue`, `/opsx:ff`, `/opsx:apply`, `/opsx:verify`, `/opsx:sync`, `/opsx:archive`, `/opsx:bulk-archive`, `/opsx:onboard`
-   Schema: `spec-driven`; project context and per-artifact rules in `openspec/config.yaml`
-   Skills live in `.agents/skills/` (`.claude/skills` is a symlink)

## Agent-Specific Instructions

-   **Claude Code** — See `CLAUDE.md`
-   **GitHub Copilot** — OpenSpec prompts in `.github/prompts/`
-   **Pi** — OpenSpec prompts in `.pi/prompts/`
