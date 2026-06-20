# 00 - Groceries brand header on signed-in screens

## Behavior

Signed-in screens have no recognizable app identity at the top. Add a slim
`Groceries` brand header that appears on every signed-in page and is absent on the
auth pages (sign in, password new/edit, invitation accept). Bottom navigation
remains the primary-destination navigation.

`Lists` does not render through `PageLayout` (only `ListContainer`,
`TemplatesContainer`, and the error pages do), so the brand header must reach every
signed-in screen regardless of whether the page uses `PageLayout`.

## Decisions

- Render the brand header from the app shell on the same condition the bottom nav
  uses (signed-in and not an auth page), so it covers `Lists` and any page that
  does not use `PageLayout`. Rules out per-page header wiring, which would miss
  `Lists`.
- The brand header is chrome, not a page title; existing per-page `PageLayout`
  titles (`data-test-id="page-title"`) keep working beneath it. Rules out replacing
  page titles with the brand bar.
- Keep the header slim and sticky/fixed at top; reserve top space so content is not
  occluded (mirror the existing bottom-nav padding pattern in `src/index.css`).
- New `data-test-id`s may be added for the brand header; do not rename or remove any
  existing selector, and do not change bottom-nav destinations.

## Tasks

- [ ] Add a slim Groceries brand header rendered from the app shell, gated on the
      existing signed-in-and-not-auth condition.
- [ ] Reserve top spacing so page content (including `Lists` and `PageLayout` pages)
      is not hidden behind the header.
- [ ] Leave bottom navigation and its destinations unchanged.
- [ ] Add/adjust component tests for the brand header and the show/hide condition;
      update affected snapshots only as required by the change.

## Acceptance criteria

- [ ] A slim Groceries brand header is visible at the top of every signed-in screen,
      including `/lists`, `/templates`, a single list, and the share screen.
- [ ] The brand header is absent on `/users/sign_in`, `/users/password/new`,
      `/users/password/edit`, and `/users/invitation/accept`.
- [ ] Page content is fully visible and scrollable with no clipping behind the brand
      header on the screens above.
- [ ] Bottom navigation is still present on signed-in screens and its four
      destinations (`nav-lists`, `nav-templates`, `nav-invite`, `nav-settings`) are
      unchanged.
- [ ] Existing `data-test-id` selectors and the login page layout are unchanged.
- [ ] `npx tsc --noEmit` and `npm run lint` pass.

## Required documentation updates

- No durable design-system doc exists in this repo; the app shell is self-evident in
  code. If the brand header introduces a new shell spacing token, document its
  purpose as a comment beside it in `src/index.css`. No other doc updates required.
