---
name: codex-redesign-lists-page-structure-and-actions
---

# Lists page structure and actions

## Goal

Make Lists a balanced list-management screen with clear hierarchy, one path per destination, and usable touch actions.

## Decisions

- Remove the Lists-page `Manage Templates` link; Templates remains in primary navigation.
- Remove `Show all completed lists`; the Completed filter is the single path to completed lists.
- Preserve status filters, multi-select, and all list action meanings.

## Requirements

- Improve hierarchy and spacing for the title, filters, selection toolbar, list cards, and create-list control.
- Ensure every list action has a 44 by 44 CSS-pixel touch target on mobile.
- Preserve completion, restore, share, edit, delete, selection, filtering, and creation behavior except for form presentation handled separately.

## Constraints

- Do not change API behavior or existing data-test-id selectors.

## Evidence

- `/Users/christopherbrenner/Work/groceries/Lists-desktop.png`
- `/Users/christopherbrenner/Work/groceries/Lists-mobile.png`
- `/Users/christopherbrenner/Work/groceries/new-list-mobile.png`

## Prerequisites

None
