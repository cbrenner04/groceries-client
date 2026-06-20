# 00 - Groceries brand header on signed-in screens

## Behavior

Signed-in screens have no recognizable app identity at the top. Add a slim
`Groceries` brand header that appears on every signed-in page and is absent on the
auth pages (sign in, password new/edit, invitation accept). Bottom navigation
remains the primary-destination navigation.

There is no unified content layer. Signed-in screens follow two divergent
structures: `Lists` (`ListsContainer`) renders without `PageLayout`, while
single-list / templates / error pages render through `PageLayout`, which has its
own sticky header (`tw:sticky tw:top-0 tw:z-10`) and its own `overflow-y-auto`
scroll region. The brand header must therefore be rendered from a single place that
sits above both structures: the app shell in `src/AppRouter.tsx`, which already
computes `showBottomNav = Boolean(user) && !isAuthPage` and renders the bottom nav.

## Decisions

- Render the brand header from the app shell (`src/AppRouter.tsx`), gated on the
  same `showBottomNav` (signed-in and not an auth page) condition, so it covers
  `Lists`, `PageLayout` pages, and `InviteForm` uniformly from one insertion point.
  Rules out per-page header wiring, which would miss `Lists`.
- The brand header is chrome, not a page title; existing per-page `PageLayout`
  titles (`data-test-id="page-title"`) keep working beneath it. Rules out replacing
  page titles with the brand bar.
- Stacking/offset with `PageLayout`'s sticky header: the brand bar sits at viewport
  top and `PageLayout`'s sticky page-title header must remain visible and stick
  *below* the brand bar, not under it. Reserve top space for content (below) so the
  page-title bar's `top-0` resolves beneath the brand bar — i.e. the brand bar
  occupies the top band and the page-title bar sticks at the band's bottom edge.
  Rules out a brand bar that overlaps and occludes the page-title bar when scrolled.
- Pin the brand header z-index using the existing token scale in `src/index.css`
  (`--z-nav: 200`, `--z-sticky: 100`, `--z-toast: 500`): the brand bar uses
  `--z-nav` so it sits above `PageLayout`'s page header (`z-10` / `--z-sticky`
  band) and the in-page add button, at parity with the bottom nav, and below toasts
  and the settings menu/overlay (`--z-overlay`+). Rules out an ad-hoc value that
  lands the brand bar over toasts or under the page content.
- Reserve top space *conditionally*, tied to the same React gating condition (not a
  global `body` rule). The bottom-nav space reservation is a global `body`
  `padding-bottom`, which is safe only because nothing renders below the fold on
  auth pages; a global *top* padding would push down the auth pages and the centered
  invite card, contradicting "absent on auth pages." Apply the top offset from the
  shell only when the brand header renders. Rules out mirroring the global
  bottom-nav padding pattern.
- `InviteForm` (`/users/invitation/new`, the `nav-invite` destination) is *not* an
  auth page in `isAuthPage`, so the brand header renders over it. It uses a centered
  `max-w-sm` card; the brand bar over a centered card is correct and the offset
  applies normally — no special-casing. Rules out treating its centered card as a
  layout to "fix."
- New `data-test-id`s may be added for the brand header; do not rename or remove any
  existing selector, and do not change bottom-nav destinations.

## Tasks

- [ ] Add a slim Groceries brand header rendered from the app shell
      (`src/AppRouter.tsx`), gated on the existing `showBottomNav` condition.
- [ ] Give the brand header a z-index from the token scale (`--z-nav`) so it stacks
      above `PageLayout`'s page header and below toasts/overlays.
- [ ] Reserve top spacing conditionally (only when the brand header renders) so page
      content — `Lists`, `PageLayout` pages, and `InviteForm` — is not hidden behind
      the brand header, and `PageLayout`'s sticky page-title header sticks below it.
- [ ] Leave bottom navigation and its destinations unchanged.
- [ ] Add/adjust component tests for the brand header and the show/hide condition;
      update affected snapshots only as required by the change.

## Acceptance criteria

- [ ] A slim Groceries brand header is visible at the top of every signed-in screen,
      including `/lists`, `/templates`, a single list, the share screen, and
      `/users/invitation/new`.
- [ ] The brand header is absent on `/users/sign_in`, `/users/password/new`,
      `/users/password/edit`, and `/users/invitation/accept`, and those pages are not
      pushed down by any top offset.
- [ ] Page content is fully visible and scrollable with no clipping behind the brand
      header on the signed-in screens above.
- [ ] On a single list (a `PageLayout` page), the per-page title bar
      (`data-test-id="page-title"`) stays visible and is not occluded by the brand
      header when the content is scrolled.
- [ ] Bottom navigation is still present on signed-in screens and its four
      destinations (`nav-lists`, `nav-templates`, `nav-invite`, `nav-settings`) are
      unchanged.
- [ ] Existing `data-test-id` selectors and the login page layout are unchanged.
- [ ] `npx tsc --noEmit`, `npm run lint`, and the full `npm test` suite pass.

## Required documentation updates

- No durable design-system doc exists in this repo; the app shell is self-evident in
  code. If the brand header introduces a new shell spacing or z-index token,
  document its purpose as a comment beside it in `src/index.css`. No other doc
  updates required.
