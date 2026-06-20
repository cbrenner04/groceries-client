# 01 - Responsive page gutters and desktop content width

## Behavior

Signed-in content currently stretches edge-to-edge on wide viewports and uses
ad-hoc per-page horizontal padding (`tw:px-4` in `PageLayout` and route
containers). Apply consistent responsive page gutters and cap signed-in content at
an intentional desktop width so it does not sprawl across large screens, while
staying full-width and comfortably guttered on mobile.

## Decisions

- Apply the gutters and max content width at the shell/content layer so every
  signed-in screen inherits it, rather than editing each route container. Rules out
  per-route width handling, which drifts.
- Cap applies to signed-in content; the bottom nav and brand header chrome may span
  full viewport width with their content centered to the same measure. Rules out
  constraining the fixed chrome bars themselves.
- Leave the auth pages' existing centered card layout (`max-w-sm`) untouched. Rules
  out re-theming the login direction.
- Pick one intentional desktop max width and one responsive gutter scale; centered
  with horizontal auto margins. Deferred to first consumer: exact max-width value —
  pin to a single token used by all signed-in screens.

## Tasks

- [ ] Constrain signed-in page content to a single intentional max width, centered,
      applied once at the shell/content layer.
- [ ] Apply consistent responsive horizontal gutters (smaller on mobile, larger on
      wide viewports) to signed-in content.
- [ ] Keep the auth/login card layout unchanged.
- [ ] Update affected component tests/snapshots only as required by the change.

## Acceptance criteria

- [ ] On a wide desktop viewport, signed-in content (`/lists`, `/templates`, a
      single list) is centered and does not exceed the chosen max width.
- [ ] On a mobile viewport, the same screens use the responsive gutter and remain
      full-width within it with no horizontal overflow.
- [ ] All signed-in screens share the same content measure and gutter (no per-route
      divergence in horizontal padding/width).
- [ ] The login page and other auth screens keep their existing centered-card layout.
- [ ] Bottom-nav destinations, API calls, and existing `data-test-id` selectors are
      unchanged.
- [ ] `npx tsc --noEmit` and `npm run lint` pass.

## Required documentation updates

- If a new content-width or gutter token is added to the `@theme` block in
  `src/index.css`, document its intent as an adjacent comment. No other durable doc
  exists to update.
