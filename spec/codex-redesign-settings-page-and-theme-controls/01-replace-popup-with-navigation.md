# 01 - Navigate to Settings page and remove popup

## Problem

The bottom-nav Settings entry currently toggles the `SettingsMenu` popup instead of navigating: `AppRouter` intercepts clicks on `nav-settings` (`handleBottomNavClickCapture`), tracks `settingsMenuOpen`, fakes the nav active state via `currentPath={settingsMenuOpen ? '/settings' : location.pathname}`, and routes the popup's sign-out through `handleSettingsMenuClickCapture`. With the dedicated page from subspec 00 in place, the Settings entry should navigate to `/settings` like every other nav item, and the popup should be removed.

## Decisions

Remove the `SettingsMenu` component and its overlay wiring entirely rather than leave it dormant — the page replaces it.
The bottom-nav Settings entry stays a `Link` to `/settings`; once interception is removed it navigates normally and active state derives from the real `location.pathname`, so no nav-active special-casing remains.
Keep the app-level logout flow (`handleLogout`: DELETE `/auth/sign_out`, `signOutUser`, toast "Log out successful", redirect to `/users/sign_in`) and have the page's sign-out control invoke it; preserve session-storage key `user` and the `signInUser`/`signOutUser` APIs unchanged.

## Tasks

- [ ] Remove the popup click interception in `AppRouter` (`settingsMenuOpen` state, `handleBottomNavClickCapture`, `handleSettingsMenuClickCapture`, and the `SettingsMenu` render) and stop passing a synthesized `currentPath` to `BottomNavBar` (use the real path).
- [ ] Wire the Settings page sign-out control to the preserved logout flow.
- [ ] Delete `src/components/domain/SettingsMenu.tsx` and `SettingsMenu.spec.tsx`.
- [ ] Update `AppRouter.spec.tsx`: replace popup open/close assertions with navigation to `/settings`; keep the logout-flow assertions.
- [ ] Confirm `BottomNavBar` marks `nav-settings` active when on `/settings` via the real location.

## Acceptance criteria

- [ ] Activating the `nav-settings` entry navigates to `/settings` and renders the Settings page (no popup/overlay appears).
- [ ] While on `/settings`, the bottom nav indicates Settings as the active item (`aria-current="page"` on `nav-settings`).
- [ ] Triggering sign-out from the Settings page calls `DELETE /auth/sign_out`, clears the session, shows the "Log out successful" toast, and redirects to `/users/sign_in`.
- [ ] Session-storage key `user` and the `signInUser`/`signOutUser` behavior are unchanged.
- [ ] `SettingsMenu.tsx` and `SettingsMenu.spec.tsx` no longer exist and nothing imports `SettingsMenu`.
- [ ] `BottomNavBar.spec.tsx` stays green (nav items, routes, and active/inactive styling unchanged).

## Documentation updates

No durable docs/spec home exists in this repo (no `docs/` or `v2/docs/`); the behavior change is captured by `AppRouter.spec.tsx` and the Settings page tests. No doc files require updating.
