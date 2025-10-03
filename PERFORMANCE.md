# Client UX Performance and Stability

This document tracks performance improvements to eliminate UI flicker, optimize list interactions, and ensure predictable UX under polling.

## Objectives

- Fast, predictable list UX under polling
- No first-open flicker in list item forms
- Stable controls and test IDs regardless of background fetches
- Minimal re-renders when data unchanged
- Clear, non-duplicated error toasts

## Completed Improvements

### Core Performance Optimizations

- **Handler memoization**: All ListItem handlers (`handleItemSelect`, `handleItemEdit`, `handleItemComplete`, `handleItemRefresh`, `handleDelete`, `toggleRead`) memoized with `useCallback` to prevent unnecessary re-renders across potentially hundreds of list items
- **Component isolation**: Split ListContainer into `NotCompletedItemsSection` and `CompletedItemsSection` with React.memo for independent re-rendering
- **ListItem memoization**: Focused comparator prevents re-renders on irrelevant state changes

### Flicker Elimination

- **Field configuration prefetching**: Prefetch on mount (`REACT_APP_PREFETCH_ON_MOUNT`) and during idle (`REACT_APP_PREFETCH_IDLE`) with enhanced skeleton fallback
- **Form state handling**: Fixed initialization logic for empty vs undefined configurations; proper number field value handling (empty string → 0)
- **UI guards**: "Untitled Item" fallback for missing `itemName`; no visible "undefined" states

### Polling & Caching

- **Intelligent polling**: 5-second intervals with idle/visibility/in-flight guards; signature-based change detection prevents unnecessary updates
- **Request management**: AbortSignal support throughout; cleanup on unmount prevents stale requests
- **Multi-layer caching**:
  - Field configurations: 10-minute TTL with request deduplication
  - List prefetching: 5-minute TTL with hover (300ms delay) and idle triggers
  - Enhanced lightweight cache: 15-minute TTL, 200 item capacity

### Error Handling & UX

- **Toast deduplication**: 3-second window prevents duplicate notifications
- **Standardized durations**: Error (5000ms), warning (3000ms), success/info (2000ms)
- **Network vs server errors**: Centralized failure handling with appropriate toast routing
- **Multi-select stability**: Fixed "Select/Hide Select" text; ensured menus render under WRITE permissions

### Infrastructure

- **Category filter stability**: Preserved across polls with intelligent bucketing
- **Test reliability**: Stable axios mocks, visibility state handling, deterministic prefetch behavior
- **Navigation focus**: Immediate sync fetch on tab regain via `useNavigationFocus` hook

### API Optimizations (Service-Side)

- **Field configuration bundle endpoint**: Single optimized endpoint (`/bundle`) with stable ordering replaces multiple individual requests; reduces network overhead
- **ETag/Cache-Control headers**: Conditional requests with ETags based on configuration ID and timestamps; 10-minute cache TTL with `304 Not Modified` responses
- **Compression middleware**: Rack::Deflater enables gzip/deflate compression for all API responses; includes verification script

## Remaining Tasks

1. **Mobile Safari optimization**
   - Verify visibility/idle guards on iOS
   - Audit expensive operations (maps/sorts) on hot paths
   - Consider dynamic imports for heavy components

2. **Monitoring & budgets**
   - Add performance timings for poll/merge/apply phases
   - Lighthouse audits and bundle analysis

## Success Metrics

- ✅ No form flicker on first open
- ✅ Polling doesn't cause UI shifts when data unchanged
- ✅ List interactions feel instant under ongoing polling
- ✅ Handler stability prevents unnecessary ListItem re-renders
- ✅ Component isolation enables independent section re-rendering
