# Verdict — Refinements required before implementation

The draft's core strategy is sound (brand header rendered from the shell on the existing signed-in-and-not-auth condition; preserve the CSS-variable token contract; keep login direction). The following issues are upheld and must be resolved. Most trace to one false premise shared by subspecs 00 and 01: an "apply once at the shell/content layer" abstraction that the codebase does not have.

## Upheld — must fix

1. **No unified content layer exists; stop asserting one.** Signed-in screens follow two divergent structures: `Lists` renders without `PageLayout` (its own padding), while single-list/templates/errors use `PageLayout` (its own scroll region and sticky header). Subspecs 00 and 01 both say to apply chrome/constraints "once at the shell/content layer," but there is no single insertion point. **Outcome:** both subspecs must state explicitly where the header and the width/gutter constraint are applied given the two page structures, and acknowledge it touches more than one place (e.g., a shared wrapper adopted by both paths, or both `PageLayout` and the non-`PageLayout` path).

2. **Brand header vs. `PageLayout`'s sticky page header.** `PageLayout`'s header is sticky at the top. A brand bar fixed/sticky at viewport top will overlap it on screens AC already names ("a single list"). **Outcome:** subspec 00 needs a decision on the stacking/offset interaction and an AC verifying the per-page title bar stays visible and is not occluded by the brand header when scrolled.

3. **"Mirror the bottom-nav padding pattern" is the wrong mechanism and is misleading.** The bottom-nav space reservation is a *global* `body` padding because — but the bottom nav is gated in React, not rendered globally. A global top padding would push down the auth pages and the centered invite card, contradicting subspec 00's own "absent on auth pages" requirement. **Outcome:** subspec 00 must specify a *conditional* top-space reservation tied to the same React gating condition, and remove the bottom-nav-padding comparison.

4. **Gutter contradiction in subspec 01.** It says apply gutters at the shell layer "rather than editing each route container," yet AC demands "no per-route divergence in horizontal padding" — while `PageLayout` and route containers already pad with `px-4`. These cannot both hold without editing the route containers. **Outcome:** pick one lane and make the spec internally consistent — either gutters move to the shared wrapper and existing per-page `px-4` is removed (drop the "rather than editing each route container" claim), or gutters stay per-page unified to one token.

5. **No AC that the test suite passes.** All three subspecs churn tests/snapshots, but ACs only gate `tsc` and `lint`. **Outcome:** add a passing `npm test` (full suite) AC to each subspec; this is the real verification gate for snapshot churn.

6. **Brand-header z-index unspecified.** The repo mixes a token z-scale (`--z-nav`, `--z-toast`) with ad-hoc Tailwind values (bottom nav `z-40`, page header `z-10`). The brand header's position relative to the settings menu, toasts, and the page sticky header is undefined. **Outcome:** subspec 00 must pin the brand header's z-index explicitly (and state whether it uses the token scale or ad-hoc values). Couples with #2.

7. **InviteForm (`/users/invitation/new`) is an unhandled hybrid.** It is the `nav-invite` destination, is *not* classified as an auth page in code, yet uses the same centered `max-w-sm` card as auth pages. So the brand header *will* render on it and subspec 01's width wrapper *will* wrap its already-centered card. **Outcome:** add a one-line decision covering this screen (brand header over a centered card; outer wrapper around an inner narrower `max-w-sm` is harmless and should not be "fixed").

8. **Contrast ACs name no verification method.** Subspec 02's AA targets are well-motivated (the current code even mislabels indigo-600-on-white as AA when it is ≈4.2:1), but "meet WCAG AA" is asserted-but-untestable as written. **Outcome:** subspec 02 must name a concrete validation means and list the specific token/text-and-surface pairings to check for each contrast threshold (≥4.5:1 text, ≥3:1 borders/focus/affordances) in both themes.

9. **"Deferred to first consumer" is misapplied for the max-width value.** Every signed-in screen consumes that value immediately, so there is no future caller to pin it to — this is extra precision dressed as deferral. **Outcome:** state an intentional max-width value (or a single named token) directly in subspec 01, which also makes the "does not exceed the chosen max width" AC verifiable.

10. **Ordering dependency between 00 and 01 is undeclared.** Keeping them as separate subspecs is correct (distinct reviewable behaviors), but 01's content top-offset depends on 00's header height and both touch the same shell region. **Outcome:** declare in `index.md` that 01 builds on 00.

## Not requiring change

- Snapshot-scope language ("update affected snapshots only as required") is acceptable spec hygiene; adding the test-pass AC (#5) makes any missed snapshot self-revealing. A one-line note of likely-affected areas (auth, nav, layout) is optional, not required.

## Rationale

Findings #1–#4 must be fixed because the spec currently encodes an architecture that does not exist, which would mislead the implementer and produce contradictory acceptance criteria (intent's requirement of *consistent* gutters and an *intentional* desktop width depends on a coherent application strategy). #5, #6, #8, #9 close gaps between asserted and verifiable outcomes — the spec guidance requires acceptance criteria to be checkable observable behavior. #7 and #10 resolve real edge-case/ordering ambiguities the index does not currently surface. None of these alter the spec's goals, scope, or the token-contract-preservation approach.