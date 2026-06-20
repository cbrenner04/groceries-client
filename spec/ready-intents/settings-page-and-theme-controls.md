---
name: settings-page-and-theme-controls
---

# Settings page and theme controls

## Goal

Replace the detached Settings popup with a dedicated Settings page for theme selection and sign-out.

## Decisions

- Settings is a primary-navigation destination with its own page.
- Retain Light, Dark, and System theme options.
- Place sign out in a clearly separated destructive section.

## Requirements

- Selecting Settings navigates to a dedicated page at desktop and mobile widths.
- The selected theme is visible, selectable, accessible, and persists using current preference behavior.
- Preserve authentication APIs, session-storage keys, sign-out semantics, and existing theme options.
- Bottom navigation indicates Settings as active when that page is open.

## Evidence

- `/Users/christopherbrenner/Work/groceries/settings-menu-desktop.png`

## Prerequisites

None
