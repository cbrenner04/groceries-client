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

### Mobile Safari Performance Optimizations

- **Field sorting optimization**: Pre-sort field configurations with `useMemo` in `ListItemForm` and `ListItemFormFields` to avoid repeated sorting on each render
- **List item sorting optimization**: Memoized `sortItemsByCreatedAt` with intelligent caching based on item IDs and creation timestamps; includes cache size limits to prevent memory leaks

### Dynamic Imports & Code Splitting

- **Route-level splitting**: Lazy-loaded `BulkEditListItems`, `EditList`, `ShareList` (administrative/infrequent features) with intelligent preloading during idle time
- **Component-level splitting**: Heavy form components (`BulkEditListItemsForm`, `EditListForm`) wrapped with lazy loading and Suspense fallbacks
- **Modal components**: `ChangeOtherListModal`, `MergeModal` and other complex modals dynamically imported to reduce initial bundle size
- **Preloading strategy**: Components preloaded during idle time using `requestIdleCallback` for better perceived performance

### iOS Safari Specific Enhancements

- **Enhanced visibility detection**: Aggressive tab freezing with immediate cleanup when tab becomes hidden; polling suspended during background state
- **Memory pressure handling**: Automatic memory cleanup on high usage (>80% threshold); garbage collection hints and component state clearing
- **Touch performance optimization**: Passive event listeners for touch events to improve scroll performance and reduce main thread blocking
- **Network retry logic**: Exponential backoff retry mechanism for poor mobile connections with configurable retry limits and delays
- **Performance monitoring**: Real-time tracking of poll/merge/apply phases with detailed timing metrics and console logging

### Monitoring & Performance Budgets

- **Bundle analysis**: Integrated webpack-bundle-analyzer with interactive visualization via `npm run analyze`; source-map-explorer for granular analysis with `npm run analyze:source`
- **Webpack performance budgets**: 500KB entrypoint limit, 800KB asset limit with build-time warnings
- **Lighthouse CI**: Automated audits on merge to master with performance, accessibility, best practices, and SEO thresholds; manual triggers available via GitHub Actions
- **Performance budgets**: LCP < 2.5s, CLS < 0.1, TBT < 300ms, script size < 600KB, total size < 1MB
- **Web Vitals tracking**: Real-time monitoring of LCP, FID, CLS, TTFB, and INP with abstracted reporting layer; console logging in development, structured for future service integration (Sentry, DataDog, etc.)

### Lighthouse Audit Optimizations

- **Console error elimination**: Web Vitals error logging only fires in development to prevent Lighthouse audit failures
- **Render-blocking CSS removal**: FontAwesome loaded asynchronously via CDN with print-to-all media trick; eliminates ~200KB render-blocking resource
- **Unused CSS reduction**: Optimized Bootstrap imports to only include used components (buttons, forms, grid, navbar, etc.); excludes unused components like accordion, breadcrumb, carousel, pagination, tables, etc.
- **Bundle size reduction**: Removed FontAwesome from npm dependencies, loading from CDN instead; reduces bundle size by ~500KB

## Running Performance Tools

### Bundle Analysis

```bash
# Interactive bundle visualization (opens in browser)
npm run analyze

# Source map analysis for detailed size breakdown
npm run analyze:source
```

### Lighthouse Audits

```bash
# Desktop audit (runs 3 times for median values)
npm run lighthouse

# Mobile audit with throttling
npm run lighthouse:mobile
```

**Note**: Lighthouse audits automatically run on CI when merging to master. Results are uploaded to temporary public storage and visible in the GitHub Actions logs.

### Performance Budgets

**Webpack budgets** (enforced at build time):
- Main bundle: 500KB (warning threshold)
- Individual assets: 800KB (warning threshold)

**Lighthouse budgets** (enforced in CI):
- Script total: 600KB
- Page total: 1MB
- LCP: 2.5s (desktop), 3.5s (mobile)
- CLS: 0.1
- Total Blocking Time: 300ms (desktop), 500ms (mobile)
- Max Potential FID: 100ms (desktop), 130ms (mobile)

**Category scores**:
- Performance: 90+ (desktop), 85+ (mobile)
- Accessibility: 95+
- Best Practices: 90+
- SEO: 95+

### Web Vitals Monitoring

Web Vitals are automatically tracked in the browser and logged to console during development. The reporting layer is abstracted in `src/utils/performanceMonitoring.ts` to enable future integration with monitoring services.

**Tracked metrics**:
- **LCP** (Largest Contentful Paint): Loading performance
- **FCP** (First Contentful Paint): Time to first render
- **INP** (Interaction to Next Paint): Responsiveness and interactivity
- **CLS** (Cumulative Layout Shift): Visual stability
- **TTFB** (Time to First Byte): Server response time

**To integrate with a monitoring service** (Sentry, DataDog, etc.):
1. Add the service SDK to dependencies
2. Update `reportMetric()` in `src/utils/performanceMonitoring.ts`
3. Replace console logging with service-specific reporting calls

## Remaining Tasks

None - all performance optimization tasks completed!

## Success Metrics

- ✅ No form flicker on first open
- ✅ Polling doesn't cause UI shifts when data unchanged
- ✅ List interactions feel instant under ongoing polling
- ✅ Handler stability prevents unnecessary ListItem re-renders
- ✅ Component isolation enables independent section re-rendering
