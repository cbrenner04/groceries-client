---
name: codex-redesign-responsive-create-and-edit-forms
---

# Responsive create and edit forms

## Goal

Use a reliable form pattern for list/template create, edit, and sharing workflows.

## Decisions

- Desktop: centered, bounded dialog.
- Mobile: bottom sheet with a viewport height limit, internal scrolling, and sticky actions.
- Every covered form has Cancel and a primary submit action.
- Cover New/Edit List, Share List, and New/Edit Template.

## Requirements

- At 390 by 844 CSS pixels, forms open without horizontal overflow and expose heading, first field, and action footer.
- Long forms scroll inside the sheet, not behind it.
- Preserve existing fields, validation, cancellation, API shapes, and data-test-id selectors.

## Evidence

- `/Users/christopherbrenner/Work/groceries/edit-list-desktop.png`
- `/Users/christopherbrenner/Work/groceries/edit-list-mobile-1.png`
- `/Users/christopherbrenner/Work/groceries/new-list-mobile.png`
- `/Users/christopherbrenner/Work/groceries/new-template-form-mobile-1.png`

## Prerequisites

None
