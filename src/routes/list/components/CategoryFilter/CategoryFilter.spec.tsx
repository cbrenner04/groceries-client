import React from 'react';
import { render, type RenderResult } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';

import CategoryFilter, { type ICategoryFilterProps } from './index';

interface ISetupReturn extends RenderResult {
  user: UserEvent;
  props: ICategoryFilterProps;
}

function setup(suppliedProps?: Partial<ICategoryFilterProps>): ISetupReturn {
  const user = userEvent.setup();
  const defaultProps: ICategoryFilterProps = {
    handleClearFilter: jest.fn(),
    handleCategoryFilter: jest.fn(),
  };
  const props = { ...defaultProps, ...suppliedProps };

  const component = render(<CategoryFilter {...props} />);

  return { ...component, props, user };
}

describe('CategoryFilter', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders Filtered when categories and filter exist', async () => {
    const { container, findByRole } = setup({
      categories: ['Produce', 'Dairy'],
      filter: 'Produce',
    });

    expect(container).toMatchSnapshot();
    expect(await findByRole('button')).toHaveTextContent('Produce');
  });

  it('renders dropdown when categories exist but filter is empty string', async () => {
    const { container, findByRole } = setup({ categories: ['Produce', 'Dairy'], filter: '' });

    expect(container).toMatchSnapshot();
    expect(await findByRole('button')).toHaveTextContent('Filter by category');
  });

  it('renders dropdown when categories exist but filter is undefined', async () => {
    const { container, findByRole } = setup({ categories: ['Produce', 'Dairy'], filter: undefined });

    expect(container).toMatchSnapshot();
    expect(await findByRole('button')).toHaveTextContent('Filter by category');
    expect(await findByRole('button')).not.toBeDisabled();
  });

  it('renders dropdown when categories do not exist', async () => {
    const { container, findByRole } = setup({ categories: undefined, filter: undefined });

    expect(container).toMatchSnapshot();
    expect(await findByRole('button')).toHaveTextContent('Filter by category');
    expect(await findByRole('button')).not.toBeDisabled();
  });

  it('renders dropdown when categories is empty array', async () => {
    const { container, findByRole } = setup({ categories: [], filter: undefined });

    expect(container).toMatchSnapshot();
    expect(await findByRole('button')).toHaveTextContent('Filter by category');
    expect(await findByRole('button')).not.toBeDisabled();
  });

  it('renders dropdown when categories array contains only empty strings', async () => {
    const { container, findByRole } = setup({ categories: ['', '', ''], filter: undefined });

    expect(container).toMatchSnapshot();
    expect(await findByRole('button')).toHaveTextContent('Filter by category');
    expect(await findByRole('button')).not.toBeDisabled();
  });

  it('renders dropdown when categories array contains some valid categories', async () => {
    const { container, findByRole } = setup({ categories: ['', 'Produce', ''], filter: undefined });

    expect(container).toMatchSnapshot();
    expect(await findByRole('button')).toHaveTextContent('Filter by category');
    expect(await findByRole('button')).not.toBeDisabled();
  });

  it('renders Filtered when filter exists but categories is undefined', async () => {
    const { container, findByRole } = setup({ categories: undefined, filter: 'Produce' });

    expect(container).toMatchSnapshot();
    expect(await findByRole('button')).toHaveTextContent('Produce');
  });

  it('renders Filtered when filter exists but categories is empty', async () => {
    const { container, findByRole } = setup({ categories: [], filter: 'Produce' });

    expect(container).toMatchSnapshot();
    expect(await findByRole('button')).toHaveTextContent('Produce');
  });

  // New tests for the updated functionality
  it('shows Uncategorized option in dropdown when no filter is applied', async () => {
    const { findByRole, findByText, user } = setup({ categories: ['Produce', 'Dairy'] });

    const dropdownButton = await findByRole('button', { name: 'Filter by category' });
    await user.click(dropdownButton);

    expect(await findByText('Uncategorized')).toBeVisible();
  });

  it('shows Uncategorized option even when no categories exist', async () => {
    const { findByRole, findByText, user } = setup({ categories: [] });

    const dropdownButton = await findByRole('button', { name: 'Filter by category' });
    await user.click(dropdownButton);

    expect(await findByText('Uncategorized')).toBeVisible();
  });

  it('shows Uncategorized option even when categories only contain empty strings', async () => {
    const { findByRole, findByText, user } = setup({ categories: ['', '', ''] });

    const dropdownButton = await findByRole('button', { name: 'Filter by category' });
    await user.click(dropdownButton);

    expect(await findByText('Uncategorized')).toBeVisible();
  });

  it('calls handleCategoryFilter with uncategorized when Uncategorized is selected', async () => {
    const { findByRole, findByText, props, user } = setup({ categories: ['Produce', 'Dairy'] });

    const dropdownButton = await findByRole('button', { name: 'Filter by category' });
    await user.click(dropdownButton);
    await user.click(await findByText('Uncategorized'));

    expect(props.handleCategoryFilter).toHaveBeenCalledWith({
      target: { name: 'uncategorized' },
    });
  });

  it('calls handleCategoryFilter with category name when valid category is selected', async () => {
    const { findByRole, findByText, props, user } = setup({ categories: ['Produce', 'Dairy'] });

    const dropdownButton = await findByRole('button', { name: 'Filter by category' });
    await user.click(dropdownButton);
    await user.click(await findByText('Produce'));

    expect(props.handleCategoryFilter).toHaveBeenCalledWith({
      target: { name: 'Produce' },
    });
  });

  it('shows both Uncategorized and valid categories in dropdown', async () => {
    const { findByRole, findByText, user } = setup({ categories: ['Produce', 'Dairy'] });

    const dropdownButton = await findByRole('button', { name: 'Filter by category' });
    await user.click(dropdownButton);

    expect(await findByText('Uncategorized')).toBeVisible();
    expect(await findByText('Produce')).toBeVisible();
    expect(await findByText('Dairy')).toBeVisible();
  });

  it('filters out empty strings from categories in dropdown', async () => {
    const { findByRole, findByText, queryAllByText, user } = setup({
      categories: ['', 'Produce', '', 'Dairy', ''],
    });

    const dropdownButton = await findByRole('button', { name: 'Filter by category' });
    await user.click(dropdownButton);

    expect(await findByText('Uncategorized')).toBeVisible();
    expect(await findByText('Produce')).toBeVisible();
    expect(await findByText('Dairy')).toBeVisible();

    // Check that there are no dropdown items with empty text
    const dropdownItems = queryAllByText('');
    const emptyDropdownItems = dropdownItems.filter((item) => item.closest('.dropdown-item') !== null);
    expect(emptyDropdownItems).toHaveLength(0);
  });

  it('has proper dropdown structure with Uncategorized option', async () => {
    const { container, findByRole, user } = setup({ categories: ['Produce'] });

    const dropdownButton = await findByRole('button', { name: 'Filter by category' });
    await user.click(dropdownButton);

    const dropdown = container.querySelector('.dropdown');
    expect(dropdown).toBeInTheDocument();

    const dropdownMenu = container.querySelector('.dropdown-menu');
    expect(dropdownMenu).toBeInTheDocument();
  });

  it('handles rapid category selections', async () => {
    const { findByRole, findByText, props, user } = setup({ categories: ['Produce', 'Dairy'] });

    const dropdownButton = await findByRole('button', { name: 'Filter by category' });
    await user.click(dropdownButton);
    await user.click(await findByText('Uncategorized'));
    await user.click(dropdownButton);
    await user.click(await findByText('Produce'));

    expect(props.handleCategoryFilter).toHaveBeenCalledTimes(2);
    expect(props.handleCategoryFilter).toHaveBeenNthCalledWith(1, {
      target: { name: 'uncategorized' },
    });
    expect(props.handleCategoryFilter).toHaveBeenNthCalledWith(2, {
      target: { name: 'Produce' },
    });
  });

  it('shows actual category name in Filtered component when filter has value', async () => {
    const { findByRole } = setup({ categories: ['Produce'], filter: 'Produce' });

    expect(await findByRole('button')).toHaveTextContent('Produce');
  });

  it('calls handleClearFilter when clear button is clicked in Filtered state', async () => {
    const { findByRole, props, user } = setup({ categories: ['Produce'], filter: 'Produce' });

    const clearButton = await findByRole('button');
    await user.click(clearButton);

    expect(props.handleClearFilter).toHaveBeenCalled();
  });
});
