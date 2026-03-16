import React from 'react';
import { render, type RenderResult } from '@testing-library/react';

import { Badge, type IBadgeProps } from './Badge';

interface ISetupReturn extends RenderResult {
  props: IBadgeProps;
}

function setup(suppliedProps: Partial<IBadgeProps> = {}): ISetupReturn {
  const defaultProps: IBadgeProps = {
    children: 'Badge',
  };
  const props = { ...defaultProps, ...suppliedProps };
  const component = render(<Badge {...props} />);
  return { ...component, props };
}

describe('Badge', () => {
  it('renders with default variant', async () => {
    const { findByText } = setup();
    const badge = await findByText('Badge');
    expect(badge).toBeVisible();
  });

  it('renders all variants', async () => {
    const variants: Array<'default' | 'primary' | 'success' | 'warning' | 'danger'> = [
      'default',
      'primary',
      'success',
      'warning',
      'danger',
    ];

    for (const variant of variants) {
      const { findByText, unmount } = setup({ variant, children: variant });
      const badge = await findByText(variant);
      expect(badge).toBeVisible();
      unmount();
    }
  });

  it('applies correct base styles', async () => {
    const { findByText } = setup();
    const badge = await findByText('Badge');
    expect(badge).toHaveClass('inline-flex');
    expect(badge).toHaveClass('items-center');
    expect(badge).toHaveClass('text-xs');
    expect(badge).toHaveClass('font-medium');
    expect(badge).toHaveClass('rounded-full');
  });

  it('passes through data-test-id attribute', async () => {
    const { findByTestId } = setup({ 'data-test-id': 'test-badge' });
    expect(await findByTestId('test-badge')).toBeVisible();
  });

  it('accepts custom className', async () => {
    const { findByText } = setup({ className: 'custom-class' });
    const badge = await findByText('Badge');
    expect(badge).toHaveClass('custom-class');
  });

  it('renders with custom children', async () => {
    const { findByText } = setup({ children: 'Custom Badge Content' });
    expect(await findByText('Custom Badge Content')).toBeVisible();
  });
});
