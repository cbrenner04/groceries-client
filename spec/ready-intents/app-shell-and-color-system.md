---
name: app-shell-and-color-system
---

# App shell and color system

## Goal

Give signed-in screens a recognizable Groceries header and an accessible, cohesive light/dark/system color system.

## Decisions

- Add a slim `Groceries` brand header to every signed-in page.
- Keep bottom navigation as the primary-destination navigation on desktop and mobile.
- Choose a new accessible palette using engineering judgment; no external brand reference applies.
- Preserve clear semantic success and destructive states.

## Requirements

- Apply consistent responsive page gutters and an intentional desktop content width.
- Establish visual hierarchy for titles, text, links, controls, cards, and borders.
- Ensure text, interaction, focus, selected, disabled, success, and destructive states are distinguishable in light and dark themes.
- Preserve the current login-page direction.

## Constraints

- Do not change API contracts, data-test-id selectors, or primary destinations.

## Evidence

- `/Users/christopherbrenner/Work/groceries/Lists-desktop.png`
- `/Users/christopherbrenner/Work/groceries/Lists-mobile.png`
- `/Users/christopherbrenner/Work/groceries/production-app-mobile.png`

## Prerequisites

None
