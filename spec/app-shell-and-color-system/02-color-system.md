# 02 - Accessible light/dark palette and semantic states

## Behavior

The color tokens in `src/index.css` (`@theme` plus the `:root` and
`[data-theme='dark']` overrides) define the current palette. Replace them with a new
cohesive, accessible palette chosen by engineering judgment (no external brand
reference) and establish clear visual hierarchy and distinguishable interaction
states across light and dark. `ThemeProvider` already resolves light/dark/system and
drives `data-theme`; this subspec changes token values and state styling, not the
theme-switching mechanism.

## Decisions

- Keep the existing CSS-variable token contract (same variable names) so consumers
  across `src/components` and `src/routes` need no edits; change values, and add new
  state tokens only where a state is otherwise indistinguishable. Rules out renaming
  tokens, which would churn every consumer.
- Preserve distinct semantic success and destructive colors in both themes. Rules
  out collapsing them into the primary accent.
- Target WCAG AA: body/control text ≥ 4.5:1 against its surface; borders, focus
  rings, and large/UI affordances ≥ 3:1. Rules out a palette that only looks
  cohesive but fails contrast.
- Selected, disabled, and focus states must be visually distinct from each other and
  from the default/hover states in both themes. Rules out conveying state by color
  alone where contrast is insufficient.
- Update both the `@theme` defaults and the `:root` / `[data-theme='dark']` blocks
  together so they stay in sync. Rules out editing one block and leaving the others
  stale.

## Tasks

- [ ] Replace the light palette values and the dark-theme overrides in
      `src/index.css` with the new cohesive palette.
- [ ] Ensure text, link, control, card, and border tokens express a clear hierarchy
      (primary vs secondary vs tertiary; surface vs raised vs overlay).
- [ ] Ensure focus, selected, disabled, success, and destructive states are
      distinguishable in both light and dark themes; add state tokens only where
      needed.
- [ ] Keep the login page direction; verify it reads correctly under the new palette
      in both themes.
- [ ] Update affected snapshots only as required by token/class changes.

## Acceptance criteria

- [ ] Body text and control labels meet WCAG AA (≥ 4.5:1) against their surfaces in
      both light and dark themes.
- [ ] Borders, focus rings, and selected affordances meet ≥ 3:1 against adjacent
      surfaces in both themes.
- [ ] Default, hover, focus, selected, and disabled states are each visually
      distinguishable from one another in both themes.
- [ ] Success and destructive states remain semantically distinct (green-family vs
      red-family or equivalently separable) and distinguishable from primary in both
      themes.
- [ ] Switching theme via the existing Settings menu (`theme-light`, `theme-dark`,
      `theme-system`) applies the new palette with no broken or illegible regions on
      `/lists`, a single list, and the login page.
- [ ] Token variable names are unchanged (no consumer in `src/components` /
      `src/routes` references a removed variable).
- [ ] `npx tsc --noEmit` and `npm run lint` pass.

## Required documentation updates

- Record the palette rationale (intended role of each color group and the AA target)
  as comments in the `@theme` block of `src/index.css`. No separate durable
  design-system doc exists in this repo to update.
