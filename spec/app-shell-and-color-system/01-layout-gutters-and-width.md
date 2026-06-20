# 01 - Responsive page gutters and desktop content width

Builds on [00 - Groceries brand header](./00-brand-header.md): the content
top-offset reserved there sits above the constrained content region introduced
here, and both touch the same shell region.

## Behavior

Signed-in content currently stretches edge-to-edge on wide viewports and uses
ad-hoc per-page horizontal padding (`tw:px-4` in `PageLayout` and in the route
containers). Apply consistent responsive page gutters and cap signed-in content at
an intentional desktop width so it does not sprawl across large screens, while
staying full-width and comfortably guttered on mobile.

There is no unified content layer (see 00): `Lists` (`ListsContainer`) renders
without `PageLayout`, while single-list / templates / errors render through
`PageLayout`. So the constraint cannot be applied in one place — it must reach both
the non-`PageLayout` `Lists` path and the `PageLayout` content region.

## Decisions

- Introduce one shared content-constraint (single max-width token + single
  responsive gutter) and apply it in both the `PageLayout` content region and the
  non-`PageLayout` `Lists` path. This touches more than one place by necessity;
  there is no single shell insertion point. Rules out a single edit that silently
  misses `Lists`.
- Remove the existing ad-hoc per-page `tw:px-4` from `PageLayout` and the route
  containers so horizontal gutters live only in the shared constraint. Rules out
  leaving the old per-page padding in place, which would double-pad and diverge.
- Cap applies to signed-in content; the bottom nav and brand header chrome may span
  full viewport width with their content centered to the same measure. Rules out
  constraining the fixed chrome bars themselves.
- Leave the auth pages' existing centered card layout (`max-w-sm`) untouched. The
  brand header renders over `InviteForm`'s centered `max-w-sm` card (see 00); the
  shared wrapper around an already-centered narrower card is harmless and must not be
  "fixed." Rules out re-theming the login direction.
- Pin one intentional desktop max width as a single named token in the `@theme`
  block of `src/index.css` (e.g. `--width-content`, value ≈ `64rem` / 1024px),
  centered with horizontal auto margins, used by every signed-in screen. Every
  signed-in screen consumes it immediately, so the value is fixed here, not deferred.

## Tasks

- [ ] Add a single content-width token (and, if needed, one gutter token) to the
      `@theme` block in `src/index.css`.
- [ ] Apply the max-width (centered) and the responsive horizontal gutter via one
      shared constraint in both the `PageLayout` content region and the
      non-`PageLayout` `Lists` path.
- [ ] Remove the ad-hoc per-page `tw:px-4` from `PageLayout` and the route
      containers so gutters are not duplicated.
- [ ] Keep the auth/login card layout unchanged.
- [ ] Update affected component tests/snapshots only as required by the change.

## Acceptance criteria

- [ ] On a wide desktop viewport, signed-in content (`/lists`, `/templates`, a
      single list) is centered and does not exceed the single content-width token
      (≈ 1024px).
- [ ] On a mobile viewport, the same screens use the responsive gutter and remain
      full-width within it with no horizontal overflow.
- [ ] All signed-in screens share the same content measure and gutter, sourced from
      the one token (no per-route divergence in horizontal padding/width, and no
      residual per-page `tw:px-4`).
- [ ] The login page and other auth screens keep their existing centered-card layout.
- [ ] Bottom-nav destinations, API calls, and existing `data-test-id` selectors are
      unchanged.
- [ ] `npx tsc --noEmit`, `npm run lint`, and the full `npm test` suite pass.

## Required documentation updates

- Document the intent of the new content-width (and gutter) token as an adjacent
  comment in the `@theme` block of `src/index.css`. No other durable doc exists to
  update.
