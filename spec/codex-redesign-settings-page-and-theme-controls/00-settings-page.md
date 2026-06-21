# 00 - Dedicated Settings page at /settings

## Problem

Theme selection and sign-out live in `SettingsMenu.tsx`, a floating popup rendered over the bottom nav. The redesign moves these into a dedicated page so Settings becomes a real primary-navigation destination with its own route. This subspec creates that page and wires its route; the next subspec switches the nav entry to it and removes the popup.

## Decisions

Reuse the existing theme control markup contract (radiogroup + three radios) rather than inventing new theme UI — persistence and accessibility are already proven against tests.
Sign out goes in a visually separated destructive section below theme controls, per the intent.
The page reaches sign-out through the existing app-level logout flow (DELETE `/auth/sign_out`, clear session, toast, redirect) rather than duplicating that logic on the page.
Render the page inside `PageLayout` with title "Settings" so it matches other pages; no back button (it is a top-level destination).

Deferred to first consumer: exact non-theme/non-sign-out page content (e.g. account info) — pin when a caller needs it. Scope here is theme + sign out only.

## Tasks

- [ ] Create a `Settings` route component under `src/routes/settings/` rendered inside `PageLayout` titled "Settings".
- [ ] Render the theme selector reusing the existing `useTheme()` hook and the radiogroup/radio contract: `role="radiogroup"` labelled "Theme" containing radios with `data-test-id` `theme-light`, `theme-dark`, `theme-system`, each reflecting selection via `aria-checked` and calling `setTheme` on click.
- [ ] Render a visually separated destructive section containing a sign-out control with `data-test-id="log-out-link"`.
- [ ] Register `/settings` in `AppRouter` routes pointing at the new component (auth-gated like other in-app pages; reachable by direct navigation when signed in).
- [ ] Add a test for the Settings page covering theme selection (active option reflected, selecting an option persists to `localStorage` key `theme`) and presence of the sign-out control.

## Acceptance criteria

- [ ] Navigating directly to `/settings` while signed in renders a page titled "Settings".
- [ ] The page exposes a theme control with selectable Light, Dark, and System options carrying `data-test-id` `theme-light`, `theme-dark`, `theme-system`, grouped as an accessible radiogroup labelled "Theme".
- [ ] The currently active theme is visibly indicated and exposed via `aria-checked` on the matching option.
- [ ] Selecting a theme option updates the active theme and persists the choice to `localStorage` under the key `theme` (existing persistence behavior unchanged).
- [ ] The page contains a destructive, visually separated section with a sign-out control carrying `data-test-id="log-out-link"`.
- [ ] `ThemeProvider.spec.tsx` stays green (theme persistence and `data-theme` behavior unchanged by this addition).

## Documentation updates

No durable docs/spec home exists in this repo (no `docs/` or `v2/docs/`); behavior is documented by the component and its tests. No doc files require updating.
