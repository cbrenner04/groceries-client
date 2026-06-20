---
name: responsive-create-and-edit-forms
---

# Responsive create and edit forms

## Goal

Use one reliable responsive form pattern for list and template create, edit, and sharing workflows.

## Decisions

- Use a centered, bounded dialog on desktop.
- Use a bottom sheet on mobile with maximum viewport height, internal scrolling, and a visible sticky action footer.
- Every covered form has Cancel and a primary submit action.
- Apply the pattern to New List, Edit List, Share List, New Template, and Edit Template.

## Requirements

- At 390 by 844 CSS pixels, a covered form opens without horizontal overflow and exposes its heading, first required field, and action footer.
- Long forms scroll within the sheet; users do not need to scroll the page behind it to reach actions.
- Desktop dialogs use readable width and content-driven height with no disproportionate empty bottom area.
- Preserve existing form fields, validation, data model, cancellation behavior, API shapes, and data-test-id selectors.

## Evidence

- `/Users/christopherbrenner/Work/groceries/edit-list-desktop.png`
- `/Users/christopherbrenner/Work/groceries/edit-list-mobile-1.png`
- `/Users/christopherbrenner/Work/groceries/edit-list-mobile-2.png`
- `/Users/christopherbrenner/Work/groceries/new-list-mobile.png`
- `/Users/christopherbrenner/Work/groceries/new-template-desktop.png`
- `/Users/christopherbrenner/Work/groceries/new-template-form-mobile-1.png`
- `/Users/christopherbrenner/Work/groceries/new-template-mobile-2.png`
- `/Users/christopherbrenner/Work/groceries/new-template-bottom-margin.png`

## Prerequisites

None
