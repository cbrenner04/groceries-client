import React from 'react';
import { render, type RenderResult } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';

import { IconButton, type IIconButtonProps } from './IconButton';

interface ISetupReturn extends RenderResult {
  props: IIconButtonProps;
  user: UserEvent;
}

function setup(suppliedProps: Partial<IIconButtonProps> = {}): ISetupReturn {
  const user = userEvent.setup();
  const defaultProps: IIconButtonProps = {
    icon: <span>✓</span>,
    label: 'Test Icon Button',
  };
  const props = { ...defaultProps, ...suppliedProps };
  const component = render(<IconButton {...props} />);
  return { ...component, props, user };
}

describe('IconButton', () => {
  it('renders with icon and aria-label', async () => {
    const { findByRole } = setup({ label: 'Delete' });
    const button = await findByRole('button', { name: 'Delete' });
    expect(button).toBeVisible();
  });

  it('renders all variants', async () => {
    const variants: Array<'default' | 'success' | 'danger' | 'primary'> = ['default', 'success', 'danger', 'primary'];

    for (const variant of variants) {
      const { findByRole, unmount } = setup({ variant, label: variant });
      const button = await findByRole('button');
      expect(button).toBeVisible();
      unmount();
    }
  });

  it('renders all sizes', async () => {
    const sizes: Array<'sm' | 'md' | 'lg'> = ['sm', 'md', 'lg'];

    for (const size of sizes) {
      const { findByRole, unmount } = setup({ size, label: size });
      const button = await findByRole('button');
      expect(button).toBeVisible();
      unmount();
    }
  });

  it('has minimum 44x44px touch target', async () => {
    const { findByRole } = setup();
    const button = await findByRole('button');
    expect(button).toHaveClass('min-h-[44px]');
    expect(button).toHaveClass('min-w-[44px]');
  });

  it('disables button when disabled prop is true', async () => {
    const { findByRole } = setup({ disabled: true });
    const button = await findByRole('button');
    expect(button).toBeDisabled();
  });

  it('handles click events when not disabled', async () => {
    const handleClick = vi.fn();
    const { findByRole, user } = setup({ onClick: handleClick });
    const button = await findByRole('button');
    await user.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('does not handle click events when disabled', async () => {
    const handleClick = vi.fn();
    const { findByRole, user } = setup({ disabled: true, onClick: handleClick });
    const button = await findByRole('button');
    await user.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('passes through data-test-id attribute', async () => {
    const { findByTestId } = setup({ 'data-test-id': 'test-icon-button' });
    expect(await findByTestId('test-icon-button')).toBeVisible();
  });

  it('requires label prop for accessibility', async () => {
    const { findByRole } = setup({ label: 'Edit item' });
    const button = await findByRole('button', { name: 'Edit item' });
    expect(button).toHaveAttribute('aria-label', 'Edit item');
  });
});
