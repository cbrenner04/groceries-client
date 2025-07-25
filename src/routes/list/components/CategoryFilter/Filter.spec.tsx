import React from 'react';
import { render, type RenderResult } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';

import Filter, { type IFilterProps } from './Filter';

interface ISetupReturn extends RenderResult {
  user: UserEvent;
  props: IFilterProps;
}

function setup(suppliedProps?: Partial<IFilterProps>): ISetupReturn {
  const user = userEvent.setup();
  const defaultProps: IFilterProps = {
    categories: ['Produce', 'Dairy', 'Meat'],
    handleCategoryFilter: jest.fn(),
  };
  const props = { ...defaultProps, ...suppliedProps };

  const component = render(<Filter {...props} />);

  return { ...component, props, user };
}

describe('Filter', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders filter dropdown', async () => {
    const { container, findByRole } = setup();

    expect(container).toMatchSnapshot();
    expect(await findByRole('button')).toHaveTextContent('Filter by category');
  });

  it('renders filter options when dropdown is clicked', async () => {
    const { container, findByRole, findByText, user } = setup();
    const dropdownButton = await findByRole('button', { name: 'Filter by category' });
    await user.click(dropdownButton);

    expect(container).toMatchSnapshot();
    expect(await findByText('Produce')).toBeVisible();
    expect(await findByText('Dairy')).toBeVisible();
    expect(await findByText('Meat')).toBeVisible();
  });

  it('calls handleCategoryFilter when filter is selected', async () => {
    const { findByRole, findByText, props, user } = setup();
    const dropdownButton = await findByRole('button', { name: 'Filter by category' });
    await user.click(dropdownButton);

    await user.click(await findByText('Produce'));

    expect(props.handleCategoryFilter).toHaveBeenCalledWith({
      target: { name: 'Produce' },
    });
  });

  it('calls handleCategoryFilter with correct category name', async () => {
    const { findByRole, findByText, props, user } = setup();
    const dropdownButton = await findByRole('button', { name: 'Filter by category' });
    await user.click(dropdownButton);

    await user.click(await findByText('Dairy'));

    expect(props.handleCategoryFilter).toHaveBeenCalledWith({
      target: { name: 'Dairy' },
    });
  });

  it('handles empty categories array', async () => {
    const { container, findByRole, user } = setup({ categories: [] });

    const dropdownButton = await findByRole('button', { name: 'Filter by category' });
    await user.click(dropdownButton);

    expect(container).toMatchSnapshot();
  });

  it('handles categories with empty strings', async () => {
    const { container, findByRole, findByText, user } = setup({
      categories: ['', 'Produce', '', 'Dairy'],
    });

    const dropdownButton = await findByRole('button', { name: 'Filter by category' });
    await user.click(dropdownButton);

    expect(await findByText('Produce')).toBeVisible();
    expect(await findByText('Dairy')).toBeVisible();
    expect(container).toMatchSnapshot();
  });

  it('handles single category', async () => {
    const { findByRole, findByText, props, user } = setup({ categories: ['Produce'] });

    const dropdownButton = await findByRole('button', { name: 'Filter by category' });
    await user.click(dropdownButton);
    await user.click(await findByText('Produce'));

    expect(props.handleCategoryFilter).toHaveBeenCalledWith({
      target: { name: 'Produce' },
    });
  });

  it('has proper dropdown structure', async () => {
    const { container } = setup();

    const dropdown = container.querySelector('.dropdown');
    expect(dropdown).toBeInTheDocument();

    const toggle = container.querySelector('#dropdown-basic');
    expect(toggle).toBeInTheDocument();
    expect(toggle?.textContent).toBe('Filter by category');
  });

  it('has proper button styling', async () => {
    const { findByRole } = setup();

    const button = await findByRole('button');
    expect(button.className).toContain('btn');
    expect(button.className).toContain('btn-light');
  });

  it('handles rapid category selections', async () => {
    const { findByRole, findByText, props, user } = setup();

    const dropdownButton = await findByRole('button', { name: 'Filter by category' });
    await user.click(dropdownButton);
    await user.click(await findByText('Produce'));
    await user.click(dropdownButton);
    await user.click(await findByText('Dairy'));

    expect(props.handleCategoryFilter).toHaveBeenCalledTimes(2);
    expect(props.handleCategoryFilter).toHaveBeenNthCalledWith(1, {
      target: { name: 'Produce' },
    });
    expect(props.handleCategoryFilter).toHaveBeenNthCalledWith(2, {
      target: { name: 'Dairy' },
    });
  });

  it('handles categories with special characters', async () => {
    const { findByRole, findByText, props, user } = setup({
      categories: ['Frozen Foods', 'Canned Goods & Preserves'],
    });

    const dropdownButton = await findByRole('button', { name: 'Filter by category' });
    await user.click(dropdownButton);
    await user.click(await findByText('Frozen Foods'));

    expect(props.handleCategoryFilter).toHaveBeenCalledWith({
      target: { name: 'Frozen Foods' },
    });
  });
});
