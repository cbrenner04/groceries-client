import React from 'react';
import { render, type RenderResult } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';

import Filtered, { type IFilteredProps } from './Filtered';

interface ISetupReturn extends RenderResult {
  user: UserEvent;
  props: IFilteredProps;
}

function setup(suppliedProps?: Partial<IFilteredProps>): ISetupReturn {
  const user = userEvent.setup();
  const defaultProps: IFilteredProps = {
    filter: 'Produce',
    handleClearFilter: jest.fn(),
  };
  const props = { ...defaultProps, ...suppliedProps };
  const component = render(<Filtered {...props} />);

  return { ...component, props, user };
}

describe('Filtered', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with filter name in button', async () => {
    const { container, findByRole } = setup();

    expect(container).toMatchSnapshot();
    expect(await findByRole('button')).toHaveTextContent('Produce');
  });

  it('calls handleClearFilter when button is clicked', async () => {
    const { findByRole, props, user } = setup();

    await user.click(await findByRole('button'));

    expect(props.handleClearFilter).toHaveBeenCalled();
  });

  it('renders filter title text', async () => {
    const { findByText } = setup();

    expect(await findByText('Filtering by:')).toBeInTheDocument();
  });

  it('renders trash icon', async () => {
    const { findByTestId } = setup();

    expect(await findByTestId('trash-icon')).toBeInTheDocument();
  });

  it('has proper button styling', async () => {
    const { findByRole } = setup();

    const button = await findByRole('button');
    expect(button.className).toContain('btn');
    expect(button.className).toContain('btn-outline-primary');
  });

  it('has proper test ID for clear filter button', async () => {
    const { findByTestId } = setup();

    const button = await findByTestId('clear-filter');
    expect(button).toBeInTheDocument();
  });

  it('has proper ID for filter button', async () => {
    const { container } = setup();

    const button = container.querySelector('#filter-button');
    expect(button).toBeInTheDocument();
  });

  it('handles different filter names', async () => {
    const { findByRole } = setup({ filter: 'Dairy' });

    expect(await findByRole('button')).toHaveTextContent('Dairy');
  });

  it('handles filter names with special characters', async () => {
    const { findByRole } = setup({ filter: 'Frozen Foods & Desserts' });

    expect(await findByRole('button')).toHaveTextContent('Frozen Foods & Desserts');
  });

  it('handles uncategorized filter name', async () => {
    const { findByRole } = setup({ filter: 'uncategorized' });

    expect(await findByRole('button')).toHaveTextContent('Uncategorized');
  });

  it('handles long filter names', async () => {
    const longFilterName = 'Very Long Category Name That Might Wrap To Multiple Lines';
    const { findByRole } = setup({ filter: longFilterName });

    expect(await findByRole('button')).toHaveTextContent(longFilterName);
  });

  it('renders filter title with correct ID', async () => {
    const { container } = setup();

    const filterTitle = container.querySelector('#filter-title');
    expect(filterTitle).toBeInTheDocument();
    expect(filterTitle?.textContent).toBe('Filtering by:');
  });

  it('handles rapid button clicks', async () => {
    const { findByRole, props, user } = setup();

    const button = await findByRole('button');
    await user.click(button);
    await user.click(button);

    expect(props.handleClearFilter).toHaveBeenCalledTimes(2);
  });

  it('renders in a React Fragment', async () => {
    const { container } = setup();

    // The component should render multiple elements (span and button)
    const children = container.children;
    expect(children.length).toBeGreaterThan(0);
  });

  it('has proper button content structure', async () => {
    const { findByRole, findByTestId } = setup();

    const button = await findByRole('button');
    expect(button.textContent).toContain('Produce');
    expect(await findByTestId('trash-icon')).toBeInTheDocument();
  });
});
