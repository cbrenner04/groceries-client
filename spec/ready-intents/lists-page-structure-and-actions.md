---
name: lists-page-structure-and-actions
---

# Lists page structure and actions

## Goal

Make Lists a clear, balanced list-management screen with one navigation path per destination and usable actions on touch devices.

## Decisions

- Remove the Lists-page `Manage Templates` link; Templates remains in primary navigation.
- Remove `Show all completed lists`; the Completed filter is the single path to completed lists.
- Keep current status filters, multi-select flow, and list-action meanings.

## Requirements

- Give the title, filters, selection toolbar, list cards, and create-list control clear spacing and hierarchy.
- Ensure each list action has a 44 by 44 CSS-pixel mobile touch target while remaining proportionate on desktop.
- Keep completion, restore, share, edit, delete, selection, filtering, and creation behavior unchanged except where the responsive-form work changes form presentation.

## Constraints

- Do not change API behavior or existing data-test-id selectors.
- Do not remove supported list actions.

## Evidence

- `/Users/christopherbrenner/Work/groceries/Lists-desktop.png`
- `/Users/christopherbrenner/Work/groceries/Lists-mobile.png`
- `/Users/christopherbrenner/Work/groceries/new-list-mobile.png`
- `/Users/christopherbrenner/Work/groceries/production-app-mobile.png`

## Prerequisites

None
