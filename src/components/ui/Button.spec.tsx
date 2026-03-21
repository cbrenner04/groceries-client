import React from 'react';
import { render, type RenderResult } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';

import { Button, type IButtonProps } from './Button';

interface ISetupReturn extends RenderResult {
  props: IButtonProps;
  user: UserEvent;
}

function setup(suppliedProps: Partial<IButtonProps> = {}): ISetupReturn {
  const user = userEvent.setup();
  const defaultProps: IButtonProps = {
    children: 'Button',
  };
  const props = { ...defaultProps, ...suppliedProps };
  const component = render(<Button {...props} />);
  return { ...component, props, user };
}

describe('Button', () => {
  it('renders with default props', async () => {
    const { findByRole } = setup();
    const button = await findByRole('button', { name: 'Button' });
    expect(button).toBeVisible();
  });

  it('renders all variants', async () => {
    const variants: Array<'primary' | 'secondary' | 'ghost' | 'danger' | 'success'> = [
      'primary',
      'secondary',
      'ghost',
      'danger',
      'success',
    ];

    for (const variant of variants) {
      const { findByRole, unmount } = setup({ variant, children: variant });
      const button = await findByRole('button');
      expect(button).toBeVisible();
      unmount();
    }
  });

  it('renders all sizes', async () => {
    const sizes: Array<'sm' | 'md' | 'lg'> = ['sm', 'md', 'lg'];

    for (const size of sizes) {
      const { findByRole, unmount } = setup({ size, children: size });
      const button = await findByRole('button');
      expect(button).toBeVisible();
      unmount();
    }
  });

  it('disables button when disabled prop is true', async () => {
    const { findByRole } = setup({ disabled: true });
    const button = await findByRole('button');
    expect(button).toBeDisabled();
  });

  it('disables button when loading prop is true', async () => {
    const { findByRole } = setup({ loading: true });
    const button = await findByRole('button');
    expect(button).toBeDisabled();
  });

  it('shows loading spinner when loading is true', async () => {
    const { findByText } = setup({ loading: true });
    expect(await findByText('Loading')).toBeVisible();
  });

  it('applies fullWidth class when fullWidth prop is true', async () => {
    const { findByRole } = setup({ fullWidth: true });
    const button = await findByRole('button');
    expect(button).toHaveClass('w-full');
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

  it('does not handle click events when loading', async () => {
    const handleClick = vi.fn();
    const { findByRole, user } = setup({ loading: true, onClick: handleClick });
    const button = await findByRole('button');
    await user.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('accepts additional className prop', async () => {
    const { findByRole } = setup({ className: 'custom-class' });
    const button = await findByRole('button');
    expect(button).toHaveClass('custom-class');
  });

  it('passes through data-test-id attribute', async () => {
    const { findByTestId } = setup({ 'data-test-id': 'test-button' });
    expect(await findByTestId('test-button')).toBeVisible();
  });

  it('renders with minimum 44px touch target', async () => {
    const { findByRole } = setup({ size: 'sm' });
    const button = await findByRole('button');
    expect(button).toHaveClass('min-h-[44px]');
  });
});
