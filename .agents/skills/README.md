# Skills Directory

This directory contains all agent skills for the atlas repository. `.claude/skills` symlinks here.

## Structure

```
.agents/skills/
├── openspec-apply-change/        # Implement tasks from OpenSpec change
├── openspec-archive-change/      # Archive completed OpenSpec change
├── openspec-bulk-archive-change/ # Archive multiple changes at once
├── openspec-continue-change/     # Continue OpenSpec change workflow
├── openspec-explore/             # OpenSpec explore mode
├── openspec-ff-change/           # Fast-forward OpenSpec artifact creation
├── openspec-new-change/          # Start new OpenSpec change
├── openspec-onboard/             # Guided OpenSpec onboarding
├── openspec-propose/             # Propose new change with all artifacts
├── openspec-sync-specs/          # Sync delta specs to main specs
└── openspec-verify-change/       # Verify implementation matches artifacts
```

## Usage

-   `/openspec-*` or `/opsx:*` — OpenSpec workflow commands
-   Run OpenSpec from the repo root; specs and changes live in `openspec/`

## Skill Format

Each skill is a directory containing:

-   `SKILL.md` — Main skill definition (required)
-   Additional supporting documents (optional)
