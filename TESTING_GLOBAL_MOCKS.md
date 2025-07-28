# Global Test Mocks

This document explains the global mocking patterns used in the test suite to reduce repetitive mocking across individual test files.

## Overview

We've implemented global mocks for commonly used libraries that are frequently mocked across multiple test files. This reduces code duplication and makes tests cleaner and more maintainable.

## Global Mocks

### 1. React Toastify (`react-toastify`)

**Location**: `src/setupTests.ts`

**What's mocked**:

- `toast` function with all its methods (`success`, `error`, `info`, `warning`, `dismiss`)
- `ToastContainer` component (returns `null`)

**Usage in tests**:

```typescript
import { toast } from 'react-toastify';

// The toast is already mocked globally, no need for individual mocking
expect(toast.success).toHaveBeenCalledWith('Success message');
```

**Helper utilities**: `src/test-utils/toastMocks.ts`

```typescript
import { mockedToast, resetToastMocks, clearToastMocks } from 'test-utils';

// Type-safe access to mocked toast
mockedToast.success.mockClear();

// Reset all toast mocks
resetToastMocks();

// Clear all toast mocks
clearToastMocks();
```

### 2. React Router (`react-router`)

**Location**: `src/setupTests.ts`

**What's mocked**:

- `useNavigate` hook (returns a mock function)

**Usage in tests**:

```typescript
import { mockNavigate } from 'test-utils';

// The navigate function is already mocked globally
expect(mockNavigate).toHaveBeenCalledWith('/some-route');
```

### 3. Other Global Mocks

- **Axios**: `utils/api` and `axios` module
- **Moment**: Consistent date handling
- **React Bootstrap**: Components to avoid transition warnings

## Migration Guide

### Before (Individual Mocking)

```typescript
jest.mock('react-toastify', () => ({
  toast: jest.fn(),
}));

const mockNavigate = jest.fn();
jest.mock('react-router', () => ({
  ...jest.requireActual('react-router'),
  useNavigate: (): jest.Mock => mockNavigate,
}));
```

### After (Global Mocks)

```typescript
import { mockNavigate } from 'test-utils';

// No individual mocking needed - toasts and navigation are globally mocked
```

## Benefits

1. **Reduced Code Duplication**: No need to repeat the same mock setup in every test file
2. **Consistency**: All tests use the same mock implementation
3. **Easier Maintenance**: Changes to mock behavior only need to be made in one place
4. **Cleaner Tests**: Test files focus on the actual test logic rather than setup
5. **Type Safety**: Helper utilities provide type-safe access to mocked functions

## Best Practices

1. **Use the helper utilities**: Import `mockNavigate` and `mockedToast` from `test-utils` for type-safe access
2. **Reset mocks when needed**: Use `resetToastMocks()` or `clearToastMocks()` in `beforeEach` if you need clean state
3. **Don't override global mocks**: Avoid individual mocking of these libraries unless absolutely necessary
4. **Import from test-utils**: Use the centralized exports for consistency

## Files Updated

The following files have been updated to use the new global mocking pattern:

- `src/setupTests.ts` - Added global mocks
- `src/test-utils/toastMocks.ts` - Toast helper utilities
- `src/test-utils/index.ts` - Centralized exports
- `src/routes/error_pages/PageNotFound.spec.tsx` - Example migration

## Future Considerations

When adding new global mocks:

1. Consider if the library is used across many test files
2. Ensure the mock is simple and doesn't interfere with test logic
3. Add appropriate helper utilities for type-safe access
4. Update this documentation
5. Consider migrating existing test files gradually
