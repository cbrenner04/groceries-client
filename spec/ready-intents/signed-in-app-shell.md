---
name: signed-in-app-shell
description: Branded slim header and responsive content shell on every signed-in page, retaining bottom navigation.
---

# Signed-in app shell

Target: groceries-client only.

## Goal

Give signed-in pages a recognizable application shell: a slim header that
establishes product identity, and content that breathes inside consistent
responsive gutters with a bounded desktop width.

## Problems

- No brand or product identity on signed-in pages.
- Content runs to the viewport edges; gutters are insufficient and desktop width is unconstrained.

## Decisions

- Every signed-in page shows a slim header branded "Groceries".
- Content avoids viewport edges with consistent responsive gutters on mobile and desktop.
- Content width is bounded on desktop so lines do not span the full viewport.
- Bottom navigation is retained on both desktop and mobile.

## Acceptance

- Signed-in Lists, Templates, and Settings each display the "Groceries" product identity in the header.
- Content keeps consistent gutters from the viewport edges across mobile and desktop widths.
- Desktop content is width-bounded rather than edge-to-edge.
- Bottom navigation remains present on desktop and mobile.

## Out of scope

- The login page.
- API request/response contracts.
- `data-test-id` selectors.
- Adding navigation destinations.

## Prerequisites

- Signed-in pages render through a shared page layout that already includes persistent bottom navigation.
