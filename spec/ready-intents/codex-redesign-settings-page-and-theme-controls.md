---
name: codex-redesign-settings-page-and-theme-controls
---

# Settings page and theme controls

## Goal

Replace the detached Settings popup with a dedicated Settings page for theme selection and sign-out.

## Decisions

- Settings is a primary-navigation destination with its own page.
- Retain Light, Dark, and System theme options.
- Place sign out in a clearly separated destructive section.

## Requirements

- Settings navigates to a dedicated page on desktop and mobile.
- The active theme is visible, selectable, accessible, and retains existing persistence behavior.
- Preserve authentication APIs, session-storage keys, sign-out behavior, and existing selectors.
- Bottom navigation indicates Settings as active on the page.

## Evidence

- `/Users/christopherbrenner/Work/groceries/settings-menu-desktop.png`

## Prerequisites

None
