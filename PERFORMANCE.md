# Client UX performance and stability plan

This document captures what we are doing to improve perceived performance, reduce UI flicker, and make list interactions predictably fast while the data model has evolved.

## What we’re aiming for

- Fast, predictable list UX under polling
- No first-open flicker in the list item form
- Stable controls and test IDs regardless of background fetches
- Minimal re-renders when nothing meaningful changed
- Clear, non-duplicated toasts for network/server errors

## Game Plan

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
- Enhanced caching strategy: Added dedicated field configuration cache service with configuration ID-based caching, 10-minute TTL, and test-environment detection; implemented opportunistic list prefetching on hover and during idle time with requestIdleCallback support; enhanced lightweight cache with configuration-specific settings for better performance characteristics
- Field configuration caching: Implemented dedicated cache service with configuration ID-based caching, 10-minute TTL, request deduplication, and idle prefetching support; integrated throughout ListContainer and ListItemForm with test-environment detection
- Opportunistic list prefetching: Added hover-based prefetching (300ms delay) and idle-time prefetching for visible lists; implemented dedicated listPrefetch service with 5-minute cache TTL and AbortSignal support for proper cleanup
- Enhanced lightweight client cache: Extended existing cache system with configuration-specific settings (15-minute TTL, 200 item capacity) for stable configuration data
- **Rendering and interaction performance optimizations**: Implemented comprehensive handler memoization with `useCallback` for all ListItem handlers (`handleItemSelect`, `handleItemEdit`, `handleItemComplete`, `handleItemRefresh`, `handleDelete`, `toggleRead`) to prevent unnecessary re-renders of potentially hundreds of list items; split ListContainer into `NotCompletedItemsSection` and `CompletedItemsSection` components for isolated re-renders; assessed list virtualization and determined current memoization optimizations address primary performance concerns without the complexity of virtualization; all 98 existing tests continue to pass

#### Technical Details: Handler Memoization Analysis

- **High Impact**: 6 handlers passed to every ListItem component (potentially 100s of instances)
  - `handleItemSelect`, `handleItemComplete`, `handleItemEdit`, `handleDelete`, `handleItemRefresh`, `toggleRead`
  - Each memoized with proper dependency arrays to prevent re-creation on unrelated state changes
- **Medium Impact**: Category filter handlers (`handleCategoryFilter`, `handleClearFilter`) memoized for CategoryFilter component
- **Component Splitting**: Created `NotCompletedItemsSection` and `CompletedItemsSection` with React.memo
  - Isolated re-renders: completed items changes don't trigger not-completed section re-renders and vice versa
  - Moved `groupByCategory` logic to `NotCompletedItemsSection` with proper memoization
- **List Virtualization Assessment**: Deferred implementation
  - Current memoization addresses primary performance concerns
  - No evidence of performance issues with typical list sizes
  - Complex category grouping makes virtualization more challenging

### To-do (prioritized)

1) Error and toast UX
   - De-duplicate toasts across polling and action handlers
   - Standardize autoClose durations and wording for network vs server errors
2) Mobile Safari focus
   - Verify visibility/idle guards behave on iOS
   - Audit long-task sources (expensive maps/sorts); move them off hot paths
   - Consider dynamic import for heavy, rarely used subroutes/components
3) Monitoring and budgets
   - Add lightweight timings around poll/merge/apply phases; emit to console in dev and to logs in prod
   - Run Lighthouse and set budgets; add bundle analyzer and identify top wins
4) Data/API opportunities (service)
   - Endpoint to deliver field configurations bundle with stable ordering
   - ETag/Cache-Control for lists and configs; gzip/brotli ensured
5) Test coverage
   - Visibility/idle guard tests across browsers (JSDOM simulations already in place)
   - Regression tests for category filter persistence across polls

### Success criteria

- No visible "undefined" or config warning flicker on first form open
- Polling does not cause UI shifts when data is unchanged
- List interactions (complete/refresh/delete/add) feel instant and remain consistent under ongoing polling
- Handler identity stability prevents unnecessary ListItem re-renders
- Component isolation allows independent re-rendering of completed vs not-completed sections
