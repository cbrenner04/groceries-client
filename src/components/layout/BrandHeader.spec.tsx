import React from 'react';
import { render } from '@testing-library/react';

import { BrandHeader } from './BrandHeader';

describe('BrandHeader', () => {
  it('renders the Groceries brand text', () => {
    const { getByText } = render(<BrandHeader />);

    expect(getByText('Groceries')).toBeVisible();
  });

  it('has the correct test id', () => {
    const { getByTestId } = render(<BrandHeader />);

    expect(getByTestId('brand-header')).toBeInTheDocument();
  });

  it('has fixed positioning at the top', () => {
    const { getByTestId } = render(<BrandHeader />);
    const header = getByTestId('brand-header');

    expect(header).toHaveClass('tw:fixed');
    expect(header).toHaveClass('tw:top-0');
    expect(header).toHaveClass('tw:left-0');
    expect(header).toHaveClass('tw:right-0');
  });

  it('has z-index set to z-nav', () => {
    const { getByTestId } = render(<BrandHeader />);
    const header = getByTestId('brand-header');

    expect(header).toHaveStyle({ zIndex: 'var(--z-nav)' });
  });
});
