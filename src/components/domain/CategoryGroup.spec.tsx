import React from 'react';
import { render, type RenderResult } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';

import { CategoryGroup, type ICategoryGroupProps } from './CategoryGroup';

interface ISetupReturn extends RenderResult {
  props: ICategoryGroupProps;
  user: UserEvent;
}

function setup(suppliedProps: Partial<ICategoryGroupProps> = {}): ISetupReturn {
  const user = userEvent.setup();
  const defaultProps: ICategoryGroupProps = {
    category: 'Produce',
    children: <div>Item 1</div>,
    itemCount: 3,
  };
  const props = { ...defaultProps, ...suppliedProps };
  const component = render(<CategoryGroup {...props} />);
  return { ...component, props, user };
}

describe('CategoryGroup', () => {
  it('renders category name in header', async () => {
    const { findByText } = setup();
    expect(await findByText('Produce')).toBeVisible();
  });

  it('renders item count badge', async () => {
    const { findByText } = setup({ itemCount: 5 });
    expect(await findByText('5')).toBeVisible();
  });

  it('renders children when expanded', async () => {
    const { findByText } = setup();
    expect(await findByText('Item 1')).toBeVisible();
  });

  it('has category-header data-test-class', () => {
    const { container } = setup();
    expect(container.querySelector('[data-test-class="category-header"]')).toBeInTheDocument();
  });

  it('renders "Other" for uncategorized (empty string category)', async () => {
    const { findByText } = setup({ category: '' });
    expect(await findByText('Other')).toBeVisible();
  });

  it('collapses when header is clicked', async () => {
    const { findByText, queryByText, user } = setup();
    const header = await findByText('Produce');
    await user.click(header);
    expect(queryByText('Item 1')).not.toBeInTheDocument();
  });

  it('expands when collapsed header is clicked', async () => {
    const { findByText, user } = setup();
    const header = await findByText('Produce');
    await user.click(header);
    await user.click(header);
    expect(await findByText('Item 1')).toBeVisible();
  });

  it('starts collapsed when defaultExpanded is false', () => {
    const { queryByText } = setup({ defaultExpanded: false });
    expect(queryByText('Item 1')).not.toBeInTheDocument();
  });

  it('starts expanded by default', async () => {
    const { findByText } = setup();
    expect(await findByText('Item 1')).toBeVisible();
  });

  it('has aria-expanded attribute on header button', () => {
    const { container } = setup();
    const headerButton = container.querySelector('[data-test-class="category-header"]');
    expect(headerButton).toHaveAttribute('aria-expanded', 'true');
  });

  it('updates aria-expanded when collapsed', async () => {
    const { container, findByText, user } = setup();
    await user.click(await findByText('Produce'));
    const headerButton = container.querySelector('[data-test-class="category-header"]');
    expect(headerButton).toHaveAttribute('aria-expanded', 'false');
  });

  it('renders multiple children', async () => {
    const { findByText } = setup({
      children: (
        <>
          <div>Item A</div>
          <div>Item B</div>
        </>
      ),
      itemCount: 2,
    });
    expect(await findByText('Item A')).toBeVisible();
    expect(await findByText('Item B')).toBeVisible();
  });

  describe('class assertions', () => {
    it('label has italic class when uncategorized', async () => {
      const { container, findByText } = setup({ category: '' });
      const label = await findByText('Other');
      expect(label).toHaveClass('tw:italic');
    });

    it('label does not have italic class when categorized', async () => {
      const { container, findByText } = setup({ category: 'Produce' });
      const label = await findByText('Produce');
      expect(label).not.toHaveClass('tw:italic');
    });

    it('chevron does not have rotate class when expanded', async () => {
      const { container } = setup({ defaultExpanded: true });
      const chevron = container.querySelector('[aria-hidden="true"]');
      expect(chevron).not.toHaveClass('tw:-rotate-90');
    });

    it('chevron has rotate class when collapsed', async () => {
      const { container, findByText, user } = setup({ defaultExpanded: true });
      await user.click(await findByText('Produce'));
      const chevron = container.querySelector('[aria-hidden="true"]');
      expect(chevron).toHaveClass('tw:-rotate-90');
    });

    it('header button has expected classes', async () => {
      const { container } = setup();
      const headerButton = container.querySelector('[data-test-class="category-header"]');
      expect(headerButton).toHaveClass(
        'tw:flex',
        'tw:items-center',
        'tw:gap-2',
        'tw:w-full',
        'tw:mb-2',
        'tw:group',
        'tw:cursor-pointer'
      );
    });

    it('divider has expected classes', async () => {
      const { container } = setup();
      const divider = container.querySelector('.tw\\:flex-1');
      expect(divider).toHaveClass('tw:flex-1', 'tw:h-px', 'tw:bg-[var(--color-border)]');
    });

    it('children container has expected classes when expanded', async () => {
      const { container, findByText } = setup();
      const headerButton = container.querySelector('[data-test-class="category-header"]');
      const childrenContainer = headerButton?.parentElement?.querySelector('.tw\\:flex.tw\\:flex-col');
      expect(childrenContainer).toHaveClass('tw:flex', 'tw:flex-col', 'tw:gap-2');
    });
  });
});
