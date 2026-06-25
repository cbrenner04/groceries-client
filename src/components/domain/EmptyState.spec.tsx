import React from 'react';
import { render, type RenderResult } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';

import { EmptyState, type IEmptyStateProps } from './EmptyState';

interface ISetupReturn extends RenderResult {
  props: IEmptyStateProps;
  user: UserEvent;
}

function setup(suppliedProps: Partial<IEmptyStateProps> = {}): ISetupReturn {
  const user = userEvent.setup();
  const defaultProps: IEmptyStateProps = {
    title: 'No items yet',
  };
  const props = { ...defaultProps, ...suppliedProps };
  const component = render(<EmptyState {...props} />);
  return { ...component, props, user };
}

describe('EmptyState', () => {
  it('renders title', async () => {
    const { findByText } = setup();
    expect(await findByText('No items yet')).toBeVisible();
  });

  it('renders description when provided', async () => {
    const { findByText } = setup({ description: 'Add items to get started' });
    expect(await findByText('Add items to get started')).toBeVisible();
  });

  it('does not render description when not provided', () => {
    const { queryByText } = setup();
    expect(queryByText('Add items to get started')).not.toBeInTheDocument();
  });

  it('renders icon when provided', () => {
    const { container } = setup({ icon: <svg data-testid="test-icon" /> });
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('does not render icon container when not provided', () => {
    const { container } = setup();
    expect(container.querySelectorAll('svg')).toHaveLength(0);
  });

  it('renders action button when provided', async () => {
    const onClick = vi.fn();
    const { findByText } = setup({ action: { label: 'Create a list', onClick } });
    expect(await findByText('Create a list')).toBeVisible();
  });

  it('calls action onClick when button is clicked', async () => {
    const onClick = vi.fn();
    const { findByText, user } = setup({ action: { label: 'Create a list', onClick } });
    await user.click(await findByText('Create a list'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('does not render action button when not provided', () => {
    const { queryByRole } = setup();
    expect(queryByRole('button')).not.toBeInTheDocument();
  });

  it('renders all elements together', async () => {
    const onClick = vi.fn();
    const { findByText } = setup({
      icon: <svg />,
      title: 'No lists yet',
      description: 'Create a list to get started',
      action: { label: 'Create a list', onClick },
    });
    expect(await findByText('No lists yet')).toBeVisible();
    expect(await findByText('Create a list to get started')).toBeVisible();
    expect(await findByText('Create a list')).toBeVisible();
  });

  it('applies container classes', () => {
    const { container } = setup();
    const mainDiv = container.firstChild;
    expect(mainDiv).toHaveClass(
      'tw:flex',
      'tw:flex-col',
      'tw:items-center',
      'tw:justify-center',
      'tw:py-16',
      'tw:px-4',
      'tw:text-center'
    );
  });

  it('applies icon wrapper classes', () => {
    const { container } = setup({ icon: <svg /> });
    const containerDiv = container.firstChild as HTMLElement;
    const iconDiv = containerDiv?.firstElementChild as HTMLElement;
    expect(iconDiv).toHaveClass(
      'tw:text-[var(--color-text-tertiary)]',
      'tw:mb-4',
      'tw:[&>svg]:tw:w-16',
      'tw:[&>svg]:tw:h-16'
    );
  });

  it('applies title classes', async () => {
    const { findByText } = setup();
    const titleElement = await findByText('No items yet');
    expect(titleElement).toHaveClass('tw:text-lg', 'tw:font-medium', 'tw:text-[var(--color-text-primary)]', 'tw:mb-1');
  });

  it('applies description classes', async () => {
    const { findByText } = setup({ description: 'Add items to get started' });
    const descElement = await findByText('Add items to get started');
    expect(descElement).toHaveClass(
      'tw:text-sm',
      'tw:text-[var(--color-text-secondary)]',
      'tw:mb-4',
      'tw:max-w-xs'
    );
  });
});
