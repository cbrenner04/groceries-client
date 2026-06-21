import React from 'react';
import { render, type RenderResult } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';

import { FilterChip, FilterChipGroup, type IFilterChipProps } from './FilterChip';

interface ISetupReturn extends RenderResult {
  props: IFilterChipProps;
  user: UserEvent;
}

function setup(suppliedProps: Partial<IFilterChipProps> = {}): ISetupReturn {
  const user = userEvent.setup();
  const defaultProps: IFilterChipProps = {
    label: 'Category',
    active: false,
    onClick: vi.fn(),
  };
  const props = { ...defaultProps, ...suppliedProps };
  const component = render(<FilterChip {...props} />);
  return { ...component, props, user };
}

describe('FilterChip', () => {
  it('renders with label', () => {
    const { getByText } = setup({ label: 'Produce' });
    expect(getByText('Produce')).toBeVisible();
  });

  it('renders inactive state with correct styles', () => {
    const { getByRole } = setup({ active: false });
    const chip = getByRole('button');
    expect(chip).toHaveClass('tw:bg-[var(--color-surface-overlay)]');
    expect(chip).toHaveClass('tw:text-[var(--color-text-secondary)]');
    expect(chip).toHaveAttribute('aria-pressed', 'false');
  });

  it('renders active state with correct styles', () => {
    const { getByRole } = setup({ active: true });
    const chip = getByRole('button');
    expect(chip).toHaveClass('tw:bg-[var(--color-primary)]');
    expect(chip).toHaveClass('tw:text-white');
    expect(chip).toHaveAttribute('aria-pressed', 'true');
  });

  it('calls onClick when clicked', async () => {
    const onClick = vi.fn();
    const { getByRole, user } = setup({ onClick });
    await user.click(getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('renders with data-test-id when testId is provided', () => {
    const { getByTestId } = setup({ testId: 'filter-by-produce' });
    expect(getByTestId('filter-by-produce')).toBeVisible();
  });

  it('does not render data-test-id when testId is not provided', () => {
    const { getByRole } = setup();
    const chip = getByRole('button');
    expect(chip).not.toHaveAttribute('data-test-id');
  });
});

describe('FilterChipGroup', () => {
  it('renders children in a wrapping row', () => {
    const { getByRole } = render(
      <FilterChipGroup>
        <FilterChip label="All" active onClick={vi.fn()} testId="clear-filter" />
        <FilterChip label="Produce" active={false} onClick={vi.fn()} testId="filter-by-produce" />
        <FilterChip label="Dairy" active={false} onClick={vi.fn()} testId="filter-by-dairy" />
      </FilterChipGroup>,
    );
    const group = getByRole('group');
    expect(group).toHaveClass('tw:flex-wrap');
    expect(group).toHaveClass('tw:flex');
    expect(group).toHaveClass('tw:gap-2');
  });

  it('accepts additional className', () => {
    const { getByRole } = render(
      <FilterChipGroup className="mt-4">
        <FilterChip label="All" active onClick={vi.fn()} />
      </FilterChipGroup>,
    );
    expect(getByRole('group')).toHaveClass('mt-4');
  });
});
