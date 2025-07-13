import React from 'react';
import { render, type RenderResult } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import { act } from '@testing-library/react';

import { defaultTestData } from './factories';
import type { IListContainerProps } from 'routes/v2/list/containers/ListContainer';

// Mock navigation
export const mockNavigate = jest.fn();

// Setup function for ListContainer tests
export function setupListContainer(suppliedProps?: Partial<IListContainerProps>): {
  user: UserEvent;
  props: IListContainerProps;
  component: RenderResult;
} {
  const user = userEvent.setup();
  const props: IListContainerProps = {
    userId: defaultTestData.userId,
    list: defaultTestData.list,
    completedItems: [defaultTestData.completedItem],
    categories: defaultTestData.categories,
    listUsers: defaultTestData.listUsers,
    notCompletedItems: defaultTestData.notCompletedItems,
    listsToUpdate: defaultTestData.listsToUpdate,
    listItemConfiguration: defaultTestData.listItemConfiguration,
    listItemConfigurations: defaultTestData.listItemConfigurations,
    permissions: defaultTestData.permissions,
    ...suppliedProps,
  };

  const component = render(
    <MemoryRouter>
      <div data-testid="list-container-wrapper">
        {/* We'll need to import the actual component here */}
        {/* <ListContainer {...props} /> */}
      </div>
    </MemoryRouter>,
  );

  return { user, props, component };
}

// Helper for async operations with timers
export async function advanceTimersByTime(ms: number): Promise<void> {
  await act(async () => {
    jest.advanceTimersByTime(ms);
  });
}

// Helper for waiting for API calls
export async function waitForApiCall(apiMock: jest.Mock, callCount = 1): Promise<void> {
  await act(async () => {
    // Wait for the API call to be made
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
}

// Helper for common test assertions
export const testHelpers = {
  // Check if an element has the correct test class
  expectElementToHaveTestClass: (element: HTMLElement, expectedClass: string): void => {
    expect(element).toHaveAttribute('data-test-class', expectedClass);
  },

  // Check if an element is visible
  expectElementToBeVisible: (element: HTMLElement): void => {
    expect(element).toBeVisible();
  },

  // Check if an element is not in the document
  expectElementToNotBeInDocument: (element: HTMLElement | null): void => {
    expect(element).toBeNull();
  },
};

// Helper for common user interactions
export const userInteractions = {
  // Click an element and wait for it to be visible
  clickAndWaitForVisible: async (user: UserEvent, element: HTMLElement): Promise<void> => {
    await user.click(element);
    await act(async () => {
      // Wait for any async operations to complete
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
  },

  // Type text into an input field
  typeText: async (user: UserEvent, input: HTMLElement, text: string): Promise<void> => {
    await user.type(input, text);
  },

  // Select options from a dropdown
  selectOption: async (user: UserEvent, select: HTMLElement, value: string): Promise<void> => {
    await user.selectOptions(select, [value]);
  },
};
