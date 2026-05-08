import React from 'react';
import { render, type RenderResult } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';

import { MultiSelectBar, type IMultiSelectBarProps, type IMultiSelectAction } from './MultiSelectBar';
import { CheckIcon } from '../icons';

interface ISetupReturn extends RenderResult {
  props: IMultiSelectBarProps;
  user: UserEvent;
}

function createAction(overrides: Partial<IMultiSelectAction> = {}): IMultiSelectAction {
  return {
    icon: <CheckIcon size="sm" />,
    label: 'Complete',
    onClick: vi.fn(),
    variant: 'success',
    testId: 'action-complete',
    ...overrides,
  };
}

function setup(suppliedProps: Partial<IMultiSelectBarProps> = {}): ISetupReturn {
  const user = userEvent.setup();
  const defaultProps: IMultiSelectBarProps = {
    selectedCount: 3,
    onClose: vi.fn(),
    actions: [createAction()],
  };
  const props = { ...defaultProps, ...suppliedProps };
  const component = render(<MultiSelectBar {...props} />);
  return { ...component, props, user };
}

describe('MultiSelectBar', () => {
  describe('rendering', () => {
    it('renders with multi-select-bar data-test-id', () => {
      const { container } = setup();
      expect(container.querySelector('[data-test-id="multi-select-bar"]')).toBeInTheDocument();
    });

    it('renders selected count', async () => {
      const { findByText } = setup({ selectedCount: 5 });
      expect(await findByText('5 selected')).toBeVisible();
    });

    it('renders count with multi-select-count data-test-id', () => {
      const { container } = setup();
      expect(container.querySelector('[data-test-id="multi-select-count"]')).toBeInTheDocument();
    });

    it('renders close button with multi-select-close data-test-id', () => {
      const { container } = setup();
      expect(container.querySelector('[data-test-id="multi-select-close"]')).toBeInTheDocument();
    });
  });

  describe('close button', () => {
    it('calls onClose when close button is clicked', async () => {
      const { container, props, user } = setup();
      const closeBtn = container.querySelector('[data-test-id="multi-select-close"]') as HTMLElement;
      await user.click(closeBtn);
      expect(props.onClose).toHaveBeenCalledTimes(1);
    });

    it('has aria-label for accessibility', () => {
      const { container } = setup();
      const closeBtn = container.querySelector('[data-test-id="multi-select-close"]');
      expect(closeBtn).toHaveAttribute('aria-label', 'Exit multi-select');
    });
  });

  describe('actions', () => {
    it('renders action buttons with correct data-test-id', () => {
      const { container } = setup();
      expect(container.querySelector('[data-test-id="action-complete"]')).toBeInTheDocument();
    });

    it('calls action onClick when action button is clicked', async () => {
      const action = createAction();
      const { container, user } = setup({ actions: [action] });
      const actionBtn = container.querySelector('[data-test-id="action-complete"]') as HTMLElement;
      await user.click(actionBtn);
      expect(action.onClick).toHaveBeenCalledTimes(1);
    });

    it('renders multiple action buttons', () => {
      const actions = [
        createAction({ testId: 'action-complete', label: 'Complete' }),
        createAction({ testId: 'action-delete', label: 'Delete', variant: 'danger' }),
        createAction({ testId: 'action-merge', label: 'Merge', variant: 'primary' }),
      ];
      const { container } = setup({ actions });
      expect(container.querySelector('[data-test-id="action-complete"]')).toBeInTheDocument();
      expect(container.querySelector('[data-test-id="action-delete"]')).toBeInTheDocument();
      expect(container.querySelector('[data-test-id="action-merge"]')).toBeInTheDocument();
    });

    it('renders action with aria-label', () => {
      const { container } = setup();
      const actionBtn = container.querySelector('[data-test-id="action-complete"]');
      expect(actionBtn).toHaveAttribute('aria-label', 'Complete');
    });

    it('renders action with default variant when variant is not specified', () => {
      const action = createAction({ variant: undefined, testId: 'action-default' });
      const { container } = setup({ actions: [action] });
      expect(container.querySelector('[data-test-id="action-default"]')).toBeInTheDocument();
    });

    it('renders no actions when empty array', () => {
      const { container } = setup({ actions: [] });
      const bar = container.querySelector('[data-test-id="multi-select-bar"]');
      expect(bar?.querySelectorAll('button').length).toBe(1); // only close button
    });
  });

  describe('accessibility', () => {
    it('has role="toolbar"', () => {
      const { container } = setup();
      const bar = container.querySelector('[data-test-id="multi-select-bar"]');
      expect(bar).toHaveAttribute('role', 'toolbar');
    });

    it('has aria-label on toolbar', () => {
      const { container } = setup();
      const bar = container.querySelector('[data-test-id="multi-select-bar"]');
      expect(bar).toHaveAttribute('aria-label', 'Multi-select actions');
    });
  });

  describe('selected count variations', () => {
    it('renders singular count', async () => {
      const { findByText } = setup({ selectedCount: 1 });
      expect(await findByText('1 selected')).toBeVisible();
    });

    it('renders zero count', async () => {
      const { findByText } = setup({ selectedCount: 0 });
      expect(await findByText('0 selected')).toBeVisible();
    });
  });
});
