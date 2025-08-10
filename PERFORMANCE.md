# Client UX performance and stability plan

This document captures what we are doing to improve perceived performance, reduce UI flicker, and make list interactions predictably fast while the data model has evolved.

### What we’re aiming for

- Fast, predictable list UX under polling
- No first-open flicker in the list item form
- Stable controls and test IDs regardless of background fetches
- Minimal re-renders when nothing meaningful changed
- Clear, non-duplicated toasts for network/server errors

### Improvements already made

- Prefetch list-item field configurations (when enabled) so the form opens with fields and without a "no config" flash; inlined a lightweight skeleton as a fallback
- Idle-time prefetch of field configurations (behind `REACT_APP_PREFETCH_IDLE`) to further reduce first-open flicker; tests keep it disabled for deterministic axios counts
- Polling hardened with idle/visibility/in-flight guards and signature-based change detection to avoid churn when data is unchanged
- Immediate sync fetch on visibility regain to reduce perceived staleness
- Request cancellation: AbortSignal support wired through polling and fetch utilities; cleanup on unmount prevents stale requests
- Kept category filter stable across polls; preserves selection and buckets intelligently
- Multi-select label fixed to "Select/Hide Select" to avoid text matcher issues; ensured menus render under WRITE
- `ListItem` memoized with a focused comparator to avoid unnecessary re-renders
- Error UX: only show the generic network toast on true network errors; server errors are routed through centralized failure handling
- Test harness reliability: provided stable axios instance mocks, visibility state, and disabled prefetch on mount by default in tests to keep counts stable; snapshots updated
- "Undefined" UI states: `itemName` guarded and UI renders "Untitled Item" when missing; added test to assert no visible "undefined"
- `REACT_APP_PREFETCH_ON_MOUNT`: enable in production to reduce first-open flicker; defaulted off in tests to keep axios.get counts deterministic
- `REACT_APP_PREFETCH_IDLE`: enable in production to prefetch field configurations during idle; defaulted off in tests for stable axios counts
- Polling respects tab visibility and can honor idleness when `REACT_APP_USE_IDLE_TIMER=true`
- Enable idle prefetch in production to maximize chance fields are ready before first open
- Form flicker elimination: Enhanced skeleton fallback implementation with proper state initialization and edge case handling for empty configurations
- First-open form flicker eliminated universally: Enhanced skeleton fallback implementation to handle empty array vs undefined scenarios, fixed state initialization logic to prevent unnecessary flicker, improved useEffect handling for preloaded configurations, all existing tests continue to pass
- Number field value handling: Fixed ListItemFormFields and BulkEditListItemsFormFields to properly handle empty string values by converting them to 0 for number inputs, ensuring consistent UI behavior and test reliability
- Test coverage improvements: Added test for idle prefetch path and "no undefined" rendering; fixed ListItemFormFields number field value handling tests; all tests now passing (76 test suites, 765 tests)
- Polling behavior refinements: Immediate sync fetch on navigation focus via useNavigationFocus hook; AbortSignal support wired through polling and fetch utilities with cleanup on unmount; polling infrastructure hardened and tested

### To-do (prioritized)

1) Prefetch and caching strategy
- Field configurations: cache by configuration id; set Cache-Control/ETag server-side
- List show: opportunistic prefetch when navigating to list route or when idle
- Consider a lightweight client cache to avoid re-render churn between identical payloads

2) Rendering and interaction performance
- Consider list virtualization for very long lists
- Stabilize handler identities with useCallback where beneficial (measure first)
- Split `ListContainer` where appropriate to isolate re-renders (measure first)

3) Error and toast UX
- De-duplicate toasts across polling and action handlers
- Standardize autoClose durations and wording for network vs server errors

4) Mobile Safari focus
- Verify visibility/idle guards behave on iOS
- Audit long-task sources (expensive maps/sorts); move them off hot paths
- Consider dynamic import for heavy, rarely used subroutes/components

5) Monitoring and budgets
- Add lightweight timings around poll/merge/apply phases; emit to console in dev and to logs in prod
- Run Lighthouse and set budgets; add bundle analyzer and identify top wins

6) Data/API opportunities (service)
- Endpoint to deliver field configurations bundle with stable ordering
- ETag/Cache-Control for lists and configs; gzip/brotli ensured

7) Test coverage
- Visibility/idle guard tests across browsers (JSDOM simulations already in place)
- Regression tests for category filter persistence across polls

### Success criteria

- ✅ No visible "undefined" or config warning flicker on first form open
- Polling does not cause UI shifts when data is unchanged
- List interactions (complete/refresh/delete/add) feel instant and remain consistent under ongoing polling

