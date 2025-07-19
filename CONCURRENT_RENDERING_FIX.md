# Concurrent Rendering Fixes

## Problem

The application was experiencing the following error in React 19:

```text
There was an error during concurrent rendering but React was able to recover by instead synchronously rendering the entire root.
```

## Root Cause

This error occurs when React's concurrent rendering features encounter issues with:

1. Multiple rapid state updates from polling intervals
2. Unbatched state updates that cause React to fall back to synchronous rendering
3. Side effects in components that aren't properly handled in concurrent mode

## Solutions Implemented

### 1. Enhanced usePolling Hook

- **File**: `src/hooks/usePolling.ts`
- **Changes**:
  - Added `startTransition` to mark polling updates as non-urgent
  - Added error handling to prevent polling from breaking
  - Wrapped callbacks in transition to help React prioritize rendering

### 2. Batch State Updates Utility

- **File**: `src/utils/batchUpdates.ts`
- **Purpose**: Provides utilities to safely batch multiple state updates
- **Functions**:
  - `batchStateUpdates()`: Batches multiple state update functions
  - `safeStateUpdate()`: Safely updates individual state with error handling

### 3. Updated Components

- **File**: `src/routes/lists/containers/ListsContainer.tsx`
- **Changes**: Modified polling callback to use `batchStateUpdates()` for multiple state updates

## Best Practices for Preventing Concurrent Rendering Issues

### 1. Use startTransition for Non-Urgent Updates

```typescript
import { startTransition } from 'react';

// For updates that aren't immediately visible to the user
startTransition(() => {
  setState(newValue);
});
```

### 2. Batch Related State Updates

```typescript
import { batchStateUpdates } from 'utils/batchUpdates';

// Instead of multiple separate setState calls
batchStateUpdates([
  () => setState1(value1),
  () => setState2(value2),
  () => setState3(value3),
]);
```

### 3. Handle Polling Carefully

- Use the enhanced `usePolling` hook
- Batch state updates in polling callbacks
- Add error handling to prevent polling from breaking

### 4. Avoid Side Effects in Render

- Move side effects to `useEffect`
- Use `useCallback` for functions passed to child components
- Avoid direct DOM manipulation during render

### 5. Use React.StrictMode in Development

- Helps identify potential concurrent rendering issues
- Double-invokes effects and state updates to catch problems early

## Testing

The fixes maintain backward compatibility and don't change the public API. All existing tests should continue to pass.

## Monitoring

Monitor the browser console for any remaining concurrent rendering warnings. If issues persist, consider:

1. Reducing polling frequencies
2. Implementing more aggressive state update batching
3. Using React's `useDeferredValue` for expensive computations
