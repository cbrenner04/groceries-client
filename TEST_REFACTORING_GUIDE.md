# Test Refactoring Guide

This document outlines the approach for refactoring the massive `ListContainer.spec.tsx` test file and provides guidelines for maintaining clean, maintainable tests.

## Problems with the Current Test File

The current `ListContainer.spec.tsx` file has several issues:

1. **Massive size**: 2,867 lines of test code
2. **Repetitive mock data**: Same test data structures repeated throughout
3. **Inconsistent patterns**: Different approaches to similar test scenarios
4. **Hard to maintain**: Changes require updating multiple places
5. **Poor organization**: Tests are not logically grouped
6. **No reusability**: Test utilities can't be shared across files

## Refactoring Strategy

### 1. Test Data Factories (`src/test-utils/factories.ts`)

**Purpose**: Centralize all test data creation to eliminate repetition and ensure consistency.

**Key Features**:

- Factory functions for creating test objects
- Pre-built test data sets for common scenarios
- Override support for test-specific customization
- Type-safe data creation

**Usage**:

```typescript
import { defaultTestData, createListItem, createField } from 'test-utils/factories';

// Use pre-built data
const props = {
  ...defaultTestData,
  permissions: EUserPermissions.READ,
};

// Create custom data
const customItem = createListItem('custom-id', false, [
  createField('field1', 'product', 'Custom Product', 'custom-id'),
]);
```

### 2. Test Helpers (`src/test-utils/helpers.ts`)

**Purpose**: Provide common test utilities and patterns for consistent test behavior.

**Key Features**:

- Common setup functions
- Timer and async operation helpers
- API mocking utilities
- User interaction helpers
- Common assertion patterns

**Usage**:

```typescript
import { setupListContainer, advanceTimersByTime, apiMocks } from 'test-utils/helpers';

// Setup component with default props
const { user, props, component } = setupListContainer({
  permissions: EUserPermissions.WRITE,
});

// Mock API responses
apiMocks.mockSuccess(axios.get, responseData);
apiMocks.mockError(axios.delete, 404);

// Handle timers
await advanceTimersByTime(3000);
```

### 3. Organized Test Structure

**Purpose**: Group related tests logically and make the test file more navigable.

**Structure**:

```typescript
describe('ListContainer', () => {
  describe('Polling', () => {
    // All polling-related tests
  });

  describe('Permissions', () => {
    // All permission-related tests
  });

  describe('Category Filtering', () => {
    // All filtering-related tests
  });

  describe('Item Operations', () => {
    describe('Delete', () => {
      // All delete-related tests
    });

    describe('Complete', () => {
      // All complete-related tests
    });
  });
});
```

## Migration Steps

### Phase 1: Create Test Utilities

- [x] Create `src/test-utils/factories.ts`
- [x] Create `src/test-utils/helpers.ts`
- [x] Create `src/test-utils/index.ts`

### Phase 2: Refactor Test File

1. **Group existing tests** by functionality
2. **Replace mock data** with factory functions
3. **Use helper functions** for common operations
4. **Organize tests** into logical describe blocks
5. **Remove duplication** by extracting common patterns

### Phase 3: Apply to Other Test Files

1. **Identify patterns** that can be reused
2. **Extend utilities** as needed
3. **Refactor other large test files** using the same approach

## Best Practices

### Test Data Management

- Use factory functions instead of inline objects
- Create specific test data sets for different scenarios
- Use overrides for test-specific customization
- Keep test data close to the tests that use it

### Test Organization

- Group related tests in describe blocks
- Use descriptive test names
- Keep individual tests focused on one behavior
- Use beforeEach for common setup

### Mocking

- Use centralized mock utilities
- Mock at the right level (API calls, not implementation details)
- Reset mocks between tests
- Use consistent mock patterns

### Async Testing

- Use proper async/await patterns
- Handle timers consistently
- Wait for async operations to complete
- Use waitFor for dynamic content

## Example: Before vs After

### Before (Current Approach)

```typescript
it('deletes item when delete is confirmed', async () => {
  axios.delete = jest.fn().mockResolvedValue({});
  const { findByText, findByTestId, queryByTestId, queryByText, user } = setup();

  expect(await findByText('not completed quantity bar not completed product')).toBeVisible();
  expect(await findByText('Bar')).toBeVisible();

  await user.click(await findByTestId('not-completed-item-delete-id5'));
  expect(await findByTestId('confirm-delete')).toBeVisible();
  await user.click(await findByTestId('confirm-delete'));

  await waitFor(() => expect(axios.delete).toHaveBeenCalledTimes(1));
  await waitFor(() => expect(queryByTestId('confirm-delete')).toBeNull());

  expect(queryByText('not completed quantity bar not completed product')).toBeNull();
  expect(queryByText('Bar')).toBeNull();
  expect(toast).toHaveBeenCalledWith('Item successfully deleted.', { type: 'info' });
});
```

### After (Refactored Approach)

```typescript
describe('Item Operations', () => {
  describe('Delete', () => {
    it('deletes item when delete is confirmed', async () => {
      apiMocks.mockSuccess(axios.delete, {});

      const { findByText, findByTestId, queryByTestId, queryByText, user } = setup();

      // Verify initial state
      expect(await findByText('not completed quantity bar not completed product')).toBeVisible();
      expect(await findByText('Bar')).toBeVisible();

      // Perform delete action
      await user.click(await findByTestId('not-completed-item-delete-id5'));
      expect(await findByTestId('confirm-delete')).toBeVisible();
      await user.click(await findByTestId('confirm-delete'));

      // Verify API call and UI updates
      await waitFor(() => expect(axios.delete).toHaveBeenCalledTimes(1));
      await waitFor(() => expect(queryByTestId('confirm-delete')).toBeNull());

      expect(queryByText('not completed quantity bar not completed product')).toBeNull();
      expect(queryByText('Bar')).toBeNull();
      expect(toast).toHaveBeenCalledWith('Item successfully deleted.', { type: 'info' });
    });
  });
});
```

## Benefits of Refactoring

1. **Reduced file size**: From 2,867 lines to ~800-1,000 lines
2. **Improved maintainability**: Changes in one place affect all tests
3. **Better organization**: Related tests are grouped together
4. **Reusable utilities**: Can be used across multiple test files
5. **Consistent patterns**: All tests follow the same structure
6. **Easier debugging**: Clear test structure makes issues easier to find
7. **Better documentation**: Test organization serves as documentation

## Next Steps

1. **Complete the refactoring** of `ListContainer.spec.tsx`
2. **Apply the pattern** to other large test files
3. **Extend utilities** based on common patterns found
4. **Document patterns** for team adoption
5. **Create linting rules** to enforce the new patterns

## Maintenance

- **Regular reviews**: Periodically review test utilities for improvements
- **Team adoption**: Ensure all team members understand and use the patterns
- **Documentation updates**: Keep this guide updated as patterns evolve
- **Performance monitoring**: Ensure test utilities don't impact test performance
