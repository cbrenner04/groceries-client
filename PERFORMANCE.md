### Client UX performance and stability plan

This document captures what we are doing to improve perceived performance, reduce UI flicker, and make list interactions predictably fast while the data model has evolved.

### What we’re aiming for

- Fast, predictable list UX under polling
- No first-open flicker in the list item form
- Stable controls and test IDs regardless of background fetches
- Minimal re-renders when nothing meaningful changed
- Clear, non-duplicated toasts for network/server errors

### Improvements already made

- Prefetch list-item field configurations (when enabled) so the form opens with fields and without a “no config” flash; inlined a lightweight skeleton as a fallback
- Polling hardened with idle/visibility/in-flight guards and signature-based change detection to avoid churn when data is unchanged
- Kept category filter stable across polls; preserves selection and buckets intelligently
- Multi-select label fixed to “Select/Hide Select” to avoid text matcher issues; ensured menus render under WRITE
- `ListItem` memoized with a focused comparator to avoid unnecessary re-renders
- Error UX: only show the generic network toast on true network errors; server errors are routed through centralized failure handling
- Test harness reliability: provided stable axios instance mocks, visibility state, and disabled prefetch on mount by default in tests to keep counts stable; snapshots updated

### To-do (prioritized)

1) Eliminate remaining first-open form flicker universally
- Prefetch while idle to maximize chance fields are ready before first open
- Keep current inline skeleton as fallback; aria-busy semantics already in place

2) Remove transient “undefined” UI states
- Normalize list/list-item shapes before render; ensure safe defaults for all fields
- Audit `itemName` and field readers for gaps; add guards where missing
- Add tests that assert no visible “undefined” during render/polling updates

3) Polling behavior refinements
- Immediate sync fetch on tab visibility regain and on navigation focus
- Dedupe/throttle overlapping polls; exponential backoff on repeated failures
- Cancel in-flight requests on unmount/route change

4) Prefetch and caching strategy
- Field configurations: cache by configuration id; set Cache-Control/ETag server-side
- List show: opportunistic prefetch when navigating to list route or when idle
- Consider a lightweight client cache to avoid re-render churn between identical payloads

5) Rendering and interaction performance
- Consider list virtualization for very long lists
- Stabilize handler identities with useCallback where beneficial (measure first)
- Split `ListContainer` where appropriate to isolate re-renders (measure first)

6) Error and toast UX
- De-duplicate toasts across polling and action handlers
- Standardize autoClose durations and wording for network vs server errors

7) Mobile Safari focus
- Verify visibility/idle guards behave on iOS
- Audit long-task sources (expensive maps/sorts); move them off hot paths
- Consider dynamic import for heavy, rarely used subroutes/components

8) Monitoring and budgets
- Add lightweight timings around poll/merge/apply phases; emit to console in dev and to logs in prod
- Run Lighthouse and set budgets; add bundle analyzer and identify top wins

9) Data/API opportunities (service)
- Endpoint to deliver field configurations bundle with stable ordering
- ETag/Cache-Control for lists and configs; gzip/brotli ensured

10) Test coverage
- Interaction tests for prefetch-on-open and prefetch-on-idle flows
- Visibility/idle guard tests across browsers (JSDOM simulations already in place)
- Regression tests for category filter persistence across polls

### Operational notes

- `REACT_APP_PREFETCH_ON_MOUNT`: enable in production to reduce first-open flicker; defaulted off in tests to keep axios.get counts deterministic
- Avoid debug logging in render paths; prefer instrumentation behind dev flags

### Success criteria

- No visible “undefined” or config warning flicker on first form open
- Polling does not cause UI shifts when data is unchanged
- List interactions (complete/refresh/delete/add) feel instant and remain consistent under ongoing polling

